import { z } from "zod";

export const refeicaoSchema = z.object({
  descricao: z.string().min(2, "Descrição obrigatória"),
  calorias: z.number().min(1, "Mínimo 1 kcal"),
  tipo_refeicao: z.enum(['Café', 'Almoço', 'Lanche', 'Jantar', 'Ceia']),
  data_hora: z.string().or(z.date()),
});

export interface Refeicao {
  id?: string;
  descricao: string;
  calorias: number;
  tipo_refeicao: 'Café' | 'Almoço' | 'Lanche' | 'Jantar' | 'Ceia';
  data_hora: string;
  user_id: string;
}

export interface Jejum {
  id?: string;
  inicio: string;
  fim?: string | null;
  duracao_segundos?: number;
  tipo_planejado: string;
  user_id: string;
}