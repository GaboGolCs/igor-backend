import { describe, expect, it, vi } from 'vitest';
import { FCMPushService } from '../src/infrastructure/messaging/FCMPushService.js';

describe('FCMPushService', () => {
  it('no consulta tokens si targetUserId está vacío (evita notificar a todos)', async () => {
    const findMany = vi.fn();
    const fakePrisma = { pushToken: { findMany } } as any;

    await new FCMPushService(fakePrisma).sendPushNotification(undefined as any, 't', 'b');

    expect(findMany).not.toHaveBeenCalled();
  });
});
