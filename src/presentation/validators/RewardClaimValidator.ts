import { z } from 'zod';

export const claimRewardSchema = z.object({
  body: z.object({
    rewardTitle: z
      .string('El título de la recompensa (rewardTitle) es obligatorio.')
      .min(3, 'El título de la recompensa debe tener al menos 3 caracteres.')
      .max(100, 'El título de la recompensa no puede exceder los 100 caracteres.'),
  }),
});