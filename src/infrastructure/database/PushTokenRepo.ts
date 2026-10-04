import {prisma} from "./prisma.js"
import {PushTokenEntity} from "../../domain/entities/PushTokenEnt.js";
import {DeviceType} from "../../domain/entities/DeviceTypeEnt.js";
import { PushTokenContract} from "../../domain/repoContracts/PushTokenRepoContract.js";

export class PrismaPushTokenRepository implements PushTokenContract {

  public async upsertToken(pushToken: PushTokenEntity): Promise<void> {
    await prisma.pushToken.upsert({
      where: { 
        token: pushToken.token 
      },
      update: {
        user_id: pushToken.userId,
        device_type: pushToken.deviceType,
        created_at: pushToken.createdAt
      },
      create: {
        id: pushToken.id,
        user_id: pushToken.userId,
        token: pushToken.token,
        device_type: pushToken.deviceType,
        created_at: pushToken.createdAt
      }
    });
  }

  public async findByToken(token: string): Promise<PushTokenEntity | null> {
    const record = await prisma.pushToken.findUnique({
      where: { token }
    });

    if (!record) return null;

    // Reconstruimos la entidad de dominio a partir del registro de DB
    return (PushTokenEntity as any).create(
      record.user_id,
      record.token,
      record.device_type as DeviceType
    );
  }
}