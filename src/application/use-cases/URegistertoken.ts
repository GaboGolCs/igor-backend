// src/application/use-cases/RegisterPushTokenUseCase.ts
import { PushTokenEntity } from '../../domain/entities/PushTokenEnt.js';
import { DeviceType } from '../../domain/entities/DeviceTypeEnt.js';
import { PushTokenContract} from '../../domain/repoContracts/PushTokenRepoContract.js';
import { RegisterPushTokenDTO } from '../dtos/RegisterTokenDTO.js';


export class RegisterPushTokenUseCase {
  constructor(private readonly pushTokenRepository: PushTokenContract) {}

  public async execute(dto: RegisterPushTokenDTO): Promise<void> {
    // Validamos el tipo de dispositivo
    if (!Object.values(DeviceType).includes(dto.deviceType as DeviceType)) {
      throw new Error(`Device type inválido: ${dto.deviceType}`);
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