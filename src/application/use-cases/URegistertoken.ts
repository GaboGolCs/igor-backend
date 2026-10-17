// src/application/use-cases/RegisterPushTokenUseCase.ts
import { PushTokenEntity } from '../../domain/entities/PushTokenEnt.js';
import { DeviceType } from '../../domain/entities/DeviceTypeEnt.js';
import { PushTokenContract} from '../../domain/repoContracts/PushTokenRepoContract.js';
import { RegisterPushTokenDTO } from '../dtos/RegisterTokenDTO.js';
import { UserRepo } from '../../infrastructure/database/UserRepo.js';
import { sessionUserNotFound } from '../errors/AppError.js';


export class RegisterPushTokenUseCase {
  constructor(private readonly pushTokenRepository: PushTokenContract) {}

  public async execute(dto: RegisterPushTokenDTO): Promise<void> {
    // El deviceType ya lo valida zod en la ruta
    if (!await new UserRepo().findById(dto.userId)) {
      throw sessionUserNotFound();
    }

    //Creamos el Token en memoria
    const pushTokenEntity = PushTokenEntity.create(
      dto.userId,
      dto.token,
      dto.deviceType as DeviceType
    );

    // Persistimos el token usando el repositorio
    await this.pushTokenRepository.upsertToken(pushTokenEntity);
  }
}