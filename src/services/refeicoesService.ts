import { supabase } from '../lib/supabase';
import { RefeicaoInput } from '../lib/validations';

export const refeicoesService = {

  // 1. LISTAR REFEIÇÕES DO USUÁRIO
  async listar() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    const { data, error } = await supabase
      .from('refeicoes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data', { ascending: false })
      .order('horario', { ascending: false });

    if (error) {
      console.error('ERRO AO LISTAR:', error);
      throw error;
    }

    return (data || []).map(ref => ({
      id: ref.id,
      user_id: ref.usuario_id,
      tipo_refeicao: ref.titulo,
      descricao: ref.descricao,
      calorias: ref.calorias,
      data_hora: `${ref.data}T${ref.horario}`
    }));
  },

  // 2. CRIAR REFEIÇÃO
  async criar(dados: RefeicaoInput) {

    console.log('DADOS RECEBIDOS:', dados);
    console.log('DATA_HORA:', dados.data_hora);

    const { data: { user } } = await supabase.auth.getUser();

    console.log('USUÁRIO LOGADO:', user);

    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    if (!dados.data_hora) {
      throw new Error('Data e horário são obrigatórios.');
    }

    const dataCompleta = new Date(dados.data_hora);

    if (isNaN(dataCompleta.getTime())) {
      throw new Error('Data inválida.');
    }

    const dataFormatada = dataCompleta.toISOString().split('T')[0];
    const horarioFormatado = dataCompleta.toTimeString().split(' ')[0];

    console.log('DATA FORMATADA:', dataFormatada);
    console.log('HORÁRIO FORMATADO:', horarioFormatado);

    const payload = {
      usuario_id: user.id,
      titulo: dados.tipo_refeicao,
      descricao: dados.descricao,
      calorias: Math.floor(dados.calorias),
      data: dataFormatada,
      horario: horarioFormatado
    };

    console.log('PAYLOAD ENVIADO:', payload);

    const { data, error } = await supabase
      .from('refeicoes')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('ERRO SUPABASE INSERT:', error);
      throw error;
    }

    console.log('REFEIÇÃO CRIADA:', data);

    return {
      id: data.id,
      user_id: data.usuario_id,
      tipo_refeicao: data.titulo,
      descricao: data.descricao,
      calorias: data.calorias,
      data_hora: `${data.data}T${data.horario}`
    };
  },

  // 3. ATUALIZAR REFEIÇÃO
  async atualizar(id: string, dados: RefeicaoInput) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    const dataCompleta = new Date(dados.data_hora);

    if (isNaN(dataCompleta.getTime())) {
      throw new Error('Data inválida.');
    }

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

    if (error) {
      console.error('ERRO AO ATUALIZAR:', error);
      throw error;
    }

    return {
      id: data.id,
      user_id: data.usuario_id,
      tipo_refeicao: data.titulo,
      descricao: data.descricao,
      calorias: data.calorias,
      data_hora: `${data.data}T${data.horario}`
    };
  },

  // 4. DELETAR REFEIÇÃO
  async deletar(id: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    const { error } = await supabase
      .from('refeicoes')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id);

    if (error) {
      console.error('ERRO AO DELETAR:', error);
      throw error;
    }

    return true;
  }
};