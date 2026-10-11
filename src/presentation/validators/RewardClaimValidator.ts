import { z } from 'zod';

export const claimRewardSchema = z.object({
    rewardTitle: z
      .string('El título de la recompensa (rewardTitle) es obligatorio.')
      .min(3, 'El título de la recompensa debe tener al menos 3 caracteres.')
      .max(100, 'El título de la recompensa no puede exceder los 100 caracteres.'),
  })


  export const updateRewardStatusSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED'], 'El estado debe ser ACCEPTED o REJECTED'),
})


export const updateRewardStatusQueryParams = z.object({
    rewardId: z.uuid('El ID de la recompensa (rewardId) debe ser un UUID válido.')
})


