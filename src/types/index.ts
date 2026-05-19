export interface Refeicao {
  id?: string;
  user_id?: string;
  descricao: string;
  calorias: number;
  tipo_refeicao: 'Café' | 'Almoço' | 'Lanche' | 'Jantar' | 'Ceia';
  data_hora: string;
}

export interface Jejum {
  id: string;
  user_id: string;
  inicio: string;
  fim: string | null;
  duracao_segundos: number | null;
  tipo_planejado: '16:8' | '18:6' | '20:4' | '24h' | 'Personalizado';
}

export interface Perfil {
  id: string;
  meta_calorica: number;
  updated_at: string;
}