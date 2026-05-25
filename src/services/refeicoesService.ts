import { supabase } from '../lib/supabase'; 
import { RefeicaoInput } from '../lib/validations'; 

export const refeicoesService = {

  // 1. LISTAR REFEIÇÕES DO USUÁRIO
  async listar() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data, error } = await supabase
      .from('refeicoes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data', { ascending: false })
      .order('horario', { ascending: false });

    if (error) throw error;

    return (data || []).map(ref => ({
      id: ref.id,
      user_id: ref.usuario_id, // Mantido como user_id para satisfazer o teu tipo 'Refeicao[]'
      tipo_refeicao: ref.titulo, 
      descricao: ref.descricao,
      calorias: ref.calorias,
      data_hora: `${ref.data}T${ref.horario}`
    }));
  },

  // 2. CRIAR REFEIÇÃO
  async criar(dados: RefeicaoInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const dataCompleta = new Date(dados.data_hora);
    const dataFormatada = dataCompleta.toISOString().split('T')[0]; 
    const horarioFormatado = dataCompleta.toTimeString().split(' ')[0]; 

    const { data, error } = await supabase
      .from('refeicoes')
      .insert([
        {
          usuario_id: user.id,
          titulo: dados.tipo_refeicao, 
          descricao: dados.descricao,
          calorias: Math.floor(dados.calorias), 
          data: dataFormatada,
          horario: horarioFormatado
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      user_id: data.usuario_id, // Mantido como user_id
      tipo_refeicao: data.titulo,
      descricao: data.descricao,
      calorias: data.calorias,
      data_hora: `${data.data}T${data.horario}`
    };
  },

  // 3. ATUALIZAR REFEIÇÃO
  async atualizar(id: string, dados: RefeicaoInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const dataCompleta = new Date(dados.data_hora);
    const dataFormatada = dataCompleta.toISOString().split('T')[0];
    const horarioFormatado = dataCompleta.toTimeString().split(' ')[0];

    const { data, error } = await supabase
      .from('refeicoes')
      .update({
        titulo: dados.tipo_refeicao,
        descricao: dados.descricao,
        calorias: Math.floor(dados.calorias),
        data: dataFormatada,
        horario: horarioFormatado
      })
      .eq('id', id)
      .eq('usuario_id', user.id) 
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      user_id: data.usuario_id, // Mantido como user_id
      tipo_refeicao: data.titulo,
      descricao: data.descricao,
      calorias: data.calorias,
      data_hora: `${data.data}T${data.horario}`
    };
  },

  // 4. DELETAR REFEIÇÃO
  async deletar(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { error } = await supabase
      .from('refeicoes')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id); 

    if (error) throw error;
    return true;
  }
};