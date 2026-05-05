import { z } from 'zod';

export const refeicaoSchema = z.object({
  descricao: z.string().min(2, "Descrição muito curta").max(50, "Máximo 50 caracteres"),
  calorias: z.number().min(0, "Calorias não podem ser negativas").max(5000),
  tipo_refeicao: z.enum(['Café', 'Almoço', 'Lanche', 'Jantar', 'Ceia']),
  data_hora: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data inválida",
  }),
});

export type RefeicaoInput = z.infer<typeof refeicaoSchema>;