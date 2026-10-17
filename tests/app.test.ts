import { afterAll, describe, expect, it, vi } from 'vitest';
import { prisma } from '../src/infrastructure/database/prisma.js';
import { api, expectError } from './helpers/fixtures.js';
import { closeConnections } from './helpers/db.js';

afterAll(closeConnections);

describe('CORS', () => {
  it('preflight desde un origen permitido (CORS_ORIGINS) habilita Authorization', async () => {
    const res = await api()
      .options('/api/v1/tips')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'authorization,content-type');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-headers']?.toLowerCase()).toContain('authorization');
  });

  it('no entrega cabeceras CORS a un origen no permitido', async () => {
    const res = await api()
      .options('/api/v1/tips')
      .set('Origin', 'https://sitio-malicioso.com')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('Errores globales en JSON', () => {
  it('400 INVALID_JSON con un body malformado', async () => {
    const res = await api()
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"identifier": ');
    expectError(res, 400, 'INVALID_JSON');
  });

  it('413 PAYLOAD_TOO_LARGE con un body de más de 100kb', async () => {
    const res = await api()
      .post('/api/v1/auth/login')
      .send({ identifier: 'x'.repeat(200 * 1024), secret: '1' });
    expectError(res, 413, 'PAYLOAD_TOO_LARGE');
  });

  it('404 ROUTE_NOT_FOUND en JSON para rutas inexistentes', async () => {
    const res = await api().get('/api/v1/no-existe');
    expectError(res, 404, 'ROUTE_NOT_FOUND');
    expect(res.headers['content-type']).toContain('application/json');
  });

  it('incluye cabeceras de seguridad (helmet)', async () => {
    const res = await api().get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('GET /health', () => {
  it('200 cuando Postgres y Redis responden', async () => {
    const res = await api().get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'ok', redis: 'ok' });
  });

  it('503 si la base de datos no responde', async () => {
    const spy = vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('BD caída'));
    const res = await api().get('/health');
    spy.mockRestore();

    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ status: 'error', database: 'error' });
  });
});

describe('Documentación OpenAPI', () => {
  it('sirve el contrato en /api/docs/openapi.json', async () => {
    const res = await api().get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.paths['/auth/login']).toBeDefined();
  });

  it('sirve Swagger UI en /api/docs/', async () => {
    const res = await api().get('/api/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});
