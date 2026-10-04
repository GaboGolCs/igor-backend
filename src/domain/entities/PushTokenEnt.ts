import { DeviceType } from './DeviceTypeEnt.js';

export class PushTokenEntity {
    private constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly token: string,
        public readonly deviceType: DeviceType,
        public readonly createdAt: Date
    ) {}

    /**
     * Factory method para instanciar un nuevo token validado antes de persistir.
     */
    public static create(userId: string, token: string, deviceType: DeviceType): PushTokenEntity{
                
        if (!token || token.trim() === '') {
            throw new Error("El token FCM no puede estar vacío");
        }
        
        return new PushTokenEntity(crypto.randomUUID(), userId, token, deviceType, new Date())
    }
}