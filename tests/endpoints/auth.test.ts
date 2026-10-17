import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';

// El correo se mockea: capturamos el token de recuperación en vez de enviarlo
const { sendPasswordResetEmail } = vi.hoisted(() => ({ sendPasswordResetEmail: vi.fn() }));
vi.mock('../../src/infrastructure/messaging/MailService.js', () => ({
  MailService: class {
    sendPasswordResetEmail = sendPasswordResetEmail;
  },
}));

import { prisma } from '../../src/infrastructure/database/prisma.js';
import { UserRepo } from '../../src/infrastructure/database/UserRepo.js';
import {
  api, bearer, createFamily, expectError, parentPayload, registerParent, uniqueSuffix,
} from '../helpers/fixtures.js';
import { closeConnections, resetDb, resetRedis } from '../helpers/db.js';

beforeAll(async () => {
  await resetDb();
  await resetRedis();
});
afterAll(closeConnections);

const login = (identifier: string, secret: string) =>
  api().post('/api/v1/auth/login').send({ identifier, secret });

describe('POST /api/v1/auth/register-parent', () => {
  it('201 con { accessToken, user } y el padre guardado con email', async () => {
    const payload = parentPayload();
    const res = await api().post('/api/v1/auth/register-parent').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: { id: expect.any(String), role: 'PARENT' },
    });
    const saved = await prisma.user.findUniqueOrThrow({ where: { id: res.body.data.user.id } });
    expect(saved.email).toBe(payload.parentEmail);
  });

  it('409 EMAIL_TAKEN con un email ya registrado', async () => {
    const { payload } = await registerParent();
    const res = await api()
      .post('/api/v1/auth/register-parent')
      .send(parentPayload({ parentEmail: payload.parentEmail }));
    expectError(res, 409, 'EMAIL_TAKEN');
  });

  it('409 ALIAS_TAKEN con un alias ya registrado', async () => {
    const { payload } = await registerParent();
    const res = await api()
      .post('/api/v1/auth/register-parent')
      .send(parentPayload({ alias: payload.alias }));
    expectError(res, 409, 'ALIAS_TAKEN');
  });

  it.each([
    ['zona horaria inexistente', { timezone: 'Marte/Olympus' }],
    ['alias con @', { alias: `ali@s_${uniqueSuffix()}` }],
    ['avatar_icon de más de 100 caracteres', { avatar_icon: 'x'.repeat(101) }],
    ['email inválido', { parentEmail: 'no-es-email' }],
    ['campo desconocido', { fullName: 'Juan' }],
  ])('400 VALIDATION_ERROR: %s', async (_case, overrides) => {
    const res = await api().post('/api/v1/auth/register-parent').send(parentPayload(overrides));
    expectError(res, 400, 'VALIDATION_ERROR');
    expect(res.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: expect.any(String) })]));
  });

  it('500 sin dejar una familia huérfana si falla la inserción del usuario', async () => {
    const familiesBefore = await prisma.family.count();
    const spy = vi.spyOn(UserRepo.prototype, 'createUser').mockRejectedValueOnce(new Error('falla simulada'));

    const res = await api().post('/api/v1/auth/register-parent').send(parentPayload());

    spy.mockRestore();
    expectError(res, 500, 'INTERNAL_ERROR');
    expect(await prisma.family.count()).toBe(familiesBefore);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('padre: 200 y el sub del token es el id real', async () => {
    const { payload, userId } = await registerParent();
    const res = await login(payload.parentEmail, payload.password);

    expect(res.status).toBe(200);
    expect(res.body.data.user).toEqual({ id: userId, role: 'PARENT' });
    expect((jwt.decode(res.body.data.accessToken) as jwt.JwtPayload).sub).toBe(userId);
  });

  it('niño: 200 con la misma forma { accessToken, user }', async () => {
    const { child } = await createFamily();
    const res = await login(child.alias, child.pin);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: { id: child.userId, role: 'CHILD' },
    });
  });

  it('401 INVALID_CREDENTIALS con contraseña incorrecta (padre y niño)', async () => {
    const { parent, child } = await createFamily();
    expectError(await login(parent.payload.parentEmail, 'otra1234'), 401, 'INVALID_CREDENTIALS');
    expectError(await login(child.alias, '9999'), 401, 'INVALID_CREDENTIALS');
  });

  it('401 INVALID_CREDENTIALS con usuario inexistente (mismo mensaje que contraseña incorrecta)', async () => {
    const { parent } = await createFamily();
    const unknownEmail = await login(`nadie_${uniqueSuffix()}@test.cl`, 'clave1234');
    const wrongPassword = await login(parent.payload.parentEmail, 'otra1234');

    expectError(unknownEmail, 401, 'INVALID_CREDENTIALS');
    expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
    expectError(await login(`nadie_${uniqueSuffix()}`, '1234'), 401, 'INVALID_CREDENTIALS');
  });

  it('401: un apoderado no puede entrar por la vía de alias', async () => {
    const { payload } = await registerParent();
    expectError(await login(payload.alias, payload.password), 401, 'INVALID_CREDENTIALS');
  });

  it('400 VALIDATION_ERROR con identificador vacío', async () => {
    expectError(await login('', '1234'), 400, 'VALIDATION_ERROR');
  });
});

describe('POST /api/v1/auth/forgot-password', () => {
  beforeEach(() => sendPasswordResetEmail.mockClear());

  it('es público y responde 200 enviando el correo a un apoderado registrado', async () => {
    const { payload } = await registerParent();
    const res = await api().post('/api/v1/auth/forgot-password').send({ email: payload.parentEmail });

    expect(res.status).toBe(200);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(payload.parentEmail, expect.any(String));
  });

  it('200 con el mismo mensaje para un email inexistente, sin enviar correo', async () => {
    const { payload } = await registerParent();
    const known = await api().post('/api/v1/auth/forgot-password').send({ email: payload.parentEmail });
    sendPasswordResetEmail.mockClear();

    const unknown = await api().post('/api/v1/auth/forgot-password').send({ email: `nadie_${uniqueSuffix()}@test.cl` });

    expect(unknown.status).toBe(200);
    expect(unknown.body).toEqual(known.body);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('200 aunque falle el envío del correo', async () => {
    const { payload } = await registerParent();
    sendPasswordResetEmail.mockRejectedValueOnce(new Error('SMTP caído'));

    const res = await api().post('/api/v1/auth/forgot-password').send({ email: payload.parentEmail });
    expect(res.status).toBe(200);
  });

  it('400 VALIDATION_ERROR con email inválido', async () => {
    expectError(await api().post('/api/v1/auth/forgot-password').send({ email: 'x' }), 400, 'VALIDATION_ERROR');
  });
});

describe('POST /api/v1/auth/reset-password', () => {
  const requestResetToken = async (email: string) => {
    sendPasswordResetEmail.mockClear();
    await api().post('/api/v1/auth/forgot-password').send({ email });
    return sendPasswordResetEmail.mock.calls[0][1] as string;
  };

  it('es público: cambia la contraseña y el token no se puede reutilizar', async () => {
    const { payload } = await registerParent();
    const token = await requestResetToken(payload.parentEmail);

    const res = await api().post('/api/v1/auth/reset-password').send({ token, newPassword: 'nueva1234' });
    expect(res.status).toBe(200);

    expect((await login(payload.parentEmail, 'nueva1234')).status).toBe(200);
    expectError(await login(payload.parentEmail, payload.password), 401, 'INVALID_CREDENTIALS');

    const reuse = await api().post('/api/v1/auth/reset-password').send({ token, newPassword: 'otra1234' });
    expectError(reuse, 400, 'INVALID_RESET_TOKEN');
  });

  it('400 INVALID_RESET_TOKEN con un token inexistente', async () => {
    const res = await api().post('/api/v1/auth/reset-password').send({ token: 'no-existe', newPassword: 'nueva1234' });
    expectError(res, 400, 'INVALID_RESET_TOKEN');
  });

  it('500 y el token sigue sirviendo si falla el guardado de la contraseña', async () => {
    const { payload } = await registerParent();
    const token = await requestResetToken(payload.parentEmail);
    const spy = vi.spyOn(UserRepo.prototype, 'updatePassword').mockRejectedValueOnce(new Error('falla simulada'));

    const failed = await api().post('/api/v1/auth/reset-password').send({ token, newPassword: 'nueva1234' });
    spy.mockRestore();
    expectError(failed, 500, 'INTERNAL_ERROR');

    const retry = await api().post('/api/v1/auth/reset-password').send({ token, newPassword: 'nueva1234' });
    expect(retry.status).toBe(200);
  });

  it('400 VALIDATION_ERROR con contraseña sin números', async () => {
    const res = await api().post('/api/v1/auth/reset-password').send({ token: 'x', newPassword: 'sinnumeros' });
    expectError(res, 400, 'VALIDATION_ERROR');
  });

  it('ignora un Authorization inválido (la ruta no exige sesión)', async () => {
    const res = await api()
      .post('/api/v1/auth/reset-password')
      .set(bearer('basura'))
      .send({ token: 'no-existe', newPassword: 'nueva1234' });
    expectError(res, 400, 'INVALID_RESET_TOKEN');
  });
});
