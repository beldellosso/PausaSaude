import { supabase } from '../lib/supabase'; 
import { RefeicaoInput } from '../lib/validations'; 

export const refeicoesService = {

  async listar() {
    const { data, error } = await supabase
      .from('refeicoes')
      .select('*')
      .order('data_hora', { ascending: false });

    if (error) throw error;
    return data;
  },


  async criar(dados: RefeicaoInput) {

    const { data, error } = await supabase
      .from('refeicoes')
      .insert([
        {
          descricao: dados.descricao,
          calorias: dados.calorias,
          tipo_refeicao: dados.tipo_refeicao,
          data_hora: dados.data_hora
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletar(id: number | string) {
    const { error } = await supabase
      .from('refeicoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};