'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { ConsumoChart } from './components/ConsumoChart';
import { supabase } from '../../lib/supabase';
import { refeicoesService } from '../../services/refeicoesService';

type TipoRefeicao = "Café" | "Almoço" | "Lanche" | "Jantar" | "Ceia";
type TipoJejum = "16:8" | "18:6" | "20:4" | "24h" | "Personalizado";
type AbaAtiva = "dashboard" | "refeicoes_crud" | "jejum_gestao" | "historicos";

interface Refeicao {
  id: string;
  user_id: string;
  tipo_refeicao: TipoRefeicao;
  descricao: string;
  calorias: number;
  data_hora: string;
}

interface Jejum {
  id: string;
  user_id: string;
  inicio: string;
  fim?: string;
  tipo_planejado: TipoJejum;
  duracao_horas?: number;
  concluido: boolean;
}

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("dashboard");
  const [userId, setUserId] = useState<string | null>(null);
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [historicoJejum, setHistoricoJejum] = useState<Jejum[]>([]);
  const [jejumAtivo, setJejumAtivo] = useState<Jejum | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [metaCalorica, setMetaCalorica] = useState<number>(2000);
  const [novaMeta, setNovaMeta] = useState('2000');
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [filtroData, setFiltroData] = useState<string>('');
  const [idRefeicaoEditando, setIdRefeicaoEditando] = useState<string | null>(null);
  const [tipoRefeicao, setTipoRefeicao] = useState<TipoRefeicao>('Almoço');
  const [descricao, setDescricao] = useState('');
  const [calorias, setCalorias] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [tipoJejumPlanejado, setTipoJejumPlanejado] = useState<TipoJejum>("16:8");

  // Carregamento inicial de dados integrados
  useEffect(() => {
    async function obterUsuarioEObterDados() {
      try {
        setCarregando(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
      setErro("Usuário não autenticado. Redirecionando...");
  
       setTimeout(() => {
      window.location.href = '/login';
      }, 1500);

       return;
     }

        const uId = session.user.id;
        setUserId(uId);

        // 1. Carrega as Refeições da API do Supabase/Service
        const dadosRefeicoes = await refeicoesService.listar(); 
        setRefeicoes(dadosRefeicoes || []);

        // 2. Carrega a Meta Calórica (Mantendo o fallback seguro no localStorage por User ID)
        const metaSalva = localStorage.getItem(`meta_${uId}`);
        if (metaSalva) {
          setMetaCalorica(Number(metaSalva));
          setNovaMeta(metaSalva);
        }

        // 3. Carrega o Histórico de Jejuns associado ao ID do usuário
        const jejunsSalvos = localStorage.getItem(`jejuns_${uId}`);
        if (jejunsSalvos) {
          const listaJejuns = JSON.parse(jejunsSalvos) as Jejum[];
          setHistoricoJejum(listaJejuns.filter((j: Jejum) => j.concluido));
          const ativo = listaJejuns.find((j: Jejum) => !j.concluido);
          if (ativo) setJejumAtivo(ativo);
        }

      } catch (err) {
        setErro("Erro ao sincronizar dados privados do perfil.");
      } finally {
        setCarregando(false);
      }
    }

    obterUsuarioEObterDados();
  }, []);

  function handleSalvarMeta() {
    if (!userId) return;
    const valor = Number(novaMeta);
    if (isNaN(valor) || valor <= 0) {
      alert("Por favor, insira uma meta calórica válida.");
      return;
    }
    setMetaCalorica(valor);
    localStorage.setItem(`meta_${userId}`, String(valor));
    setEditandoMeta(false);
    alert('Sua meta diária personalizada foi salva!');
  }

  async function handleSalvarRefeicao(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (!descricao || !calorias || !dataHora) {
      setErro('Validação: Preencha todos os campos obrigatórios para prosseguir.');
      return;
    }

    try {
      setEnviando(true);
      setErro(null);

      if (idRefeicaoEditando) {

  const refeicaoAtualizada = await refeicoesService.atualizar(
    idRefeicaoEditando,
    {
      tipo_refeicao: tipoRefeicao,
      descricao,
      calorias: Number(calorias),
      data_hora: dataHora
    }
   );

       setRefeicoes(prev =>
        prev.map(item =>
        item.id === idRefeicaoEditando
        ? refeicaoAtualizada
        : item
       )
      );
        setIdRefeicaoEditando(null);
        alert('Registro de refeição atualizado com sucesso!');
      } else {
        // Cadastra na API externa conforme regras do backend
        const respostaApi = await refeicoesService.criar({
          tipo_refeicao: tipoRefeicao,
          descricao,
          calorias: Number(calorias),
          data_hora: dataHora
        });

        // Monta o objeto local usando o ID retornado pela API se disponível, senão usa o timestamp de fallback
        const novaRefeicaoObj: Refeicao = {
          id: respostaApi?.id || `ref-${Date.now()}`,
          user_id: userId,
          tipo_refeicao: tipoRefeicao,
          descricao,
          calorias: Number(calorias),
          data_hora: dataHora
        };

        setRefeicoes(prev => [novaRefeicaoObj, ...prev]);
        alert('Refeição registrada e sincronizada com sucesso!');
      }

      // Limpa os estados do formulário
      setDescricao('');
      setCalorias('');
      setDataHora('');
    } catch (err) {
      setErro('Falha operacional ao persistir os dados do alimento.');
    } finally {
      setEnviando(false);
    }
  }

  function prepararEdicao(ref: Refeicao) {
    setIdRefeicaoEditando(ref.id);
    setTipoRefeicao(ref.tipo_refeicao);
    setDescricao(ref.descricao);
    setCalorias(String(ref.calorias));
    
    // Converte formatos de data para exibição correta no input datetime-local
    const dataFormatada = ref.data_hora.includes('Z') 
      ? ref.data_hora.substring(0, 16) 
      : ref.data_hora;
      
    setDataHora(dataFormatada);
    setAbaAtiva("refeicoes_crud");
  }

  async function handleExcluirRefeicao(id: string) {
    if (window.confirm("Deseja realmente remover permanentemente este registro do seu histórico?")) {
      try {
        await refeicoesService.deletar(id);

        setRefeicoes(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        setErro("Não foi possível excluir o registro do banco de dados.");
      }
    }
  }

  function handleIniciarJejum() {
    if (!userId) return;
    if (jejumAtivo) {
      alert("Você já possui um ciclo de jejum ativo em andamento.");
      return;
    }

    const novoJejum: Jejum = {
      id: `jej-${Date.now()}`,
      user_id: userId,
      inicio: new Date().toISOString(),
      tipo_planejado: tipoJejumPlanejado,
      concluido: false
    };

    setJejumAtivo(novoJejum);
    
    // Sincroniza salvando o estado ativo junto com o histórico no localStorage
    const atuais = [novoJejum, ...historicoJejum];
    localStorage.setItem(`jejuns_${userId}`, JSON.stringify(atuais));
  }

  function handleEncerrarJejum() {
    if (!userId || !jejumAtivo) return;
    
    const horaFim = new Date().toISOString();
    const msDiferenca = new Date(horaFim).getTime() - new Date(jejumAtivo.inicio).getTime();
    const horasCalculadas = Math.max(parseFloat((msDiferenca / (1000 * 60 * 60)).toFixed(2)), 0.1);

    const jejumConcluido: Jejum = {
      ...jejumAtivo,
      fim: horaFim,
      duracao_horas: horasCalculadas,
      concluido: true
    };

    const novoHistorico = [jejumConcluido, ...historicoJejum.filter(j => j.id !== jejumAtivo.id)];
    setHistoricoJejum(novoHistorico);
    setJejumAtivo(null);

    localStorage.setItem(`jejuns_${userId}`, JSON.stringify(novoHistorico));
    alert(`Parabéns! Jejum encerrado. Duração total: ${horasCalculadas} horas.`);
  }

  // --- LÓGICA DE MÉTRICAS E ESTATÍSTICAS REQUERIDAS ---
  const hojeString = new Date().toISOString().split('T')[0];
  const totalCaloriasHoje = refeicoes
    .filter(ref => ref.data_hora.startsWith(hojeString))
    .reduce((acc, curr) => acc + curr.calorias, 0);

  const percentualMeta = metaCalorica > 0 ? Math.min(Math.round((totalCaloriasHoje / metaCalorica) * 100), 100) : 0;
  
  // Agrupa dias únicos para cálculo real da média calórica diária
  const diasUnicos = Array.from(new Set(refeicoes.map(r => r.data_hora.split('T')[0])));
  const mediaDiariaCalorias = diasUnicos.length > 0 
    ? Math.round(refeicoes.reduce((acc, curr) => acc + curr.calorias, 0) / diasUnicos.length) 
    : 0;

  const totalJejuConcluidosNaSemana = historicoJejum.length;
  const tempoMedioJejum = totalJejuConcluidosNaSemana > 0 
    ? parseFloat((historicoJejum.reduce((acc, curr) => acc + (curr.duracao_horas || 0), 0) / totalJejuConcluidosNaSemana).toFixed(1))
    : 0;

  const refeicoesFiltradas = refeicoes.filter(ref => {
    if (!filtroData) return true;
    return ref.data_hora.startsWith(filtroData);
  });

  const dadosGraficoCalorias = refeicoesFiltradas.map(ref => ({
    name: ref.tipo_refeicao,
    calorias: ref.calorias
  }));

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#6b6053] flex">
      
      {/* Sidebar - Tom cinza azulado claro com borda suave */}
      <aside className="w-64 bg-[#f4f7f8] border-r border-[#cbe3ec] flex flex-col justify-between fixed h-full z-50">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-8 border-b border-[#cbe3ec] pb-5">
            <span className="text-2xl filter drop-shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </span>
            <span className="font-bold text-lg text-[#3a6d7f] tracking-tight">Pausa<span className="text-[#5ba1b8]">Saúde</span></span>
          </div>

          <span className="text-[10px] font-bold text-[#8ba8b3] uppercase tracking-widest block mb-3 pl-2">Módulos Privados</span>
          <nav className="space-y-1" aria-label="Menu Lateral">
            <button
              onClick={() => { setAbaAtiva("dashboard"); setIdRefeicaoEditando(null); }}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${abaAtiva === "dashboard" ? "bg-[#e2f1f6] text-[#2d5664] border border-[#bae6fd]" : "text-[#5a6e75] hover:bg-[#eaeef0]"}`}
            >
              📊 Meu Painel Geral
            </button>

            <button
              onClick={() => setAbaAtiva("refeicoes_crud")}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${abaAtiva === "refeicoes_crud" ? "bg-[#e2f1f6] text-[#2d5664] border border-[#bae6fd]" : "text-[#5a6e75] hover:bg-[#eaeef0]"}`}
            >
              🍽️ Minhas Refeições
            </button>

            <button
              onClick={() => setAbaAtiva("jejum_gestao")}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${abaAtiva === "jejum_gestao" ? "bg-[#e2f1f6] text-[#2d5664] border border-[#bae6fd]" : "text-[#5a6e75] hover:bg-[#eaeef0]"}`}
            >
              ⏱️ Iniciar/Parar Jejum
            </button>

            <button
              onClick={() => setAbaAtiva("historicos")}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${abaAtiva === "historicos" ? "bg-[#e2f1f6] text-[#2d5664] border border-[#bae6fd]" : "text-[#5a6e75] hover:bg-[#eaeef0]"}`}
            >
              📜 Histórico de Jejuns
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-[#cbe3ec] bg-[#eaeef0] text-center text-[11px] text-[#788d96] font-medium">
          Dados protegidos via ID de Usuário
        </div>
      </aside>

      <div className="flex-1 pl-64 flex flex-col justify-between min-h-screen">
        <div className="relative">
          <Navbar />

          <header className="relative w-full bg-gradient-to-r from-[#e2f1f6] to-[#f4f8f9] border-b border-[#cbe3ec] h-40 pt-16 flex items-center shadow-sm">
            <div className="absolute inset-y-0 left-0 w-1/4 bg-[#dbedf3] flex items-center justify-center pt-12">
              <span className="text-4xl filter drop-shadow-sm">📅</span>
            </div>
            <div className="absolute inset-y-0 left-[25%] w-16 text-[#dbedf3] fill-current hidden sm:block pt-12">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full"><path d="M0,0 C50,0 50,100 100,100 L0,100 Z" /></svg>
            </div>
            <div className="w-full pl-6 sm:pl-36 md:pl-48 pr-8 z-10 flex flex-col justify-center">
              <h1 className="text-xl font-bold text-[#3a6d7f] tracking-tight">Ambiente de Controle Integrado</h1>
              <p className="text-xs text-[#6b8b96] mt-1 max-w-xl leading-relaxed">Gestão em conformidade estrita com as especificações técnicas requeridas da ementa acadêmica.</p>
            </div>
          </header>

          <main className="p-6 max-w-7xl mx-auto space-y-6">
            {erro && <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-xl">{erro}</div>}

            {carregando ? (
              <div className="text-center py-10 text-xs text-gray-400">Sincronizando sua account segura...</div>
            ) : (
              <>
                {abaAtiva === "dashboard" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-[#edf0ec] shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Minha Média Calórica Histórica</span>
                        <p className="text-lg font-bold text-[#5a5045] mt-0.5">{mediaDiariaCalorias} kcal / dia</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#edf0ec] shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Meus Jejuns Concluídos</span>
                        <p className="text-lg font-bold text-emerald-600 mt-0.5">{totalJejuConcluidosNaSemana} ciclos</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#edf0ec] shadow-sm">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Meu Tempo Médio</span>
                        <p className="text-lg font-bold text-[#427b8f] mt-0.5">{tempoMedioJejum} horas</p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-[#edf0ec] shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xs font-bold text-[#8c8071] uppercase">Consumo de Hoje vs Minha Meta</h3>
                          <p className="text-xl font-bold text-[#5a5045] mt-1">{totalCaloriasHoje} <span className="text-xs font-normal text-gray-400">/ de {metaCalorica} kcal definidas</span></p>
                        </div>
                        {editandoMeta ? (
                          <div className="flex gap-2">
                            <input type="number" value={novaMeta} onChange={e => setNovaMeta(e.target.value)} className="w-20 text-xs border p-1 rounded-md" />
                            <button onClick={handleSalvarMeta} className="text-xs bg-[#e2f1f6] text-[#427b8f] px-2 py-1 rounded-md font-bold">Salvar</button>
                          </div>
                        ) : (
                          <button onClick={() => setEditandoMeta(true)} className="text-xs text-[#427b8f] hover:underline">✏️ Ajustar Meta</button>
                        )}
                      </div>
                      <div className="w-full bg-[#faf9f5] border rounded-full h-2 mt-4">
                        <div className="bg-[#bae6fd] h-2 rounded-full" style={{ width: `${percentualMeta}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-[#edf0ec] shadow-sm">
                      <h3 className="text-xs font-bold text-[#8c8071] uppercase mb-4">Amostragem dos Meus Lançamentos</h3>
                      {refeicoes.length === 0 ? (
                        <div className="text-center p-6 text-xs text-gray-400">Você ainda não forneceu dados de refeições para gerar o gráfico.</div>
                      ) : (
                        <ConsumoChart data={dadosGraficoCalorias} />
                      )}
                    </div>
                  </div>
                )}

                {abaAtiva === "refeicoes_crud" && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-[#edf0ec] shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-[#5a5045]">{idRefeicaoEditando ? '📝 Editar Meu Registro' : '➕ Adicionar Nova Refeição'}</h3>
                        {idRefeicaoEditando && (
                          <button onClick={() => { setIdRefeicaoEditando(null); setDescricao(''); setCalorias(''); setDataHora(''); }} className="text-xs text-gray-400 hover:underline">Cancelar Edição</button>
                        )}
                      </div>
                      <form onSubmit={handleSalvarRefeicao} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-medium text-[#968a7c] mb-1">Tipo de Refeição</label>
                          <select value={tipoRefeicao} onChange={e => setTipoRefeicao(e.target.value as TipoRefeicao)} className="w-full text-xs bg-[#fafaf9] border border-[#e2e0d5] rounded-xl px-3 py-2">
                            <option value="Café">Café da Manhã</option>
                            <option value="Almoço">Almoço</option>
                            <option value="Lanche">Lanche</option>
                            <option value="Jantar">Jantar</option>
                            <option value="Ceia">Ceia</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#968a7c] mb-1">Data / Horário do Alimento</label>
                          <input type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)} className="w-full text-xs bg-[#fafaf9] border border-[#e2e0d5] rounded-xl px-3 py-2"/>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-medium text-[#968a7c] mb-1">Descrição do que consumiu</label>
                          <input type="text" placeholder="Ex: Salada de frutas com aveia" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full text-xs bg-[#fafaf9] border border-[#e2e0d5] rounded-xl px-3 py-2"/>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#968a7c] mb-1">Calorias (kcal)</label>
                          <input type="number" placeholder="Ex: 310" value={calorias} onChange={e => setCalorias(e.target.value)} className="w-full text-xs bg-[#fafaf9] border border-[#e2e0d5] rounded-xl px-3 py-2"/>
                        </div>
                        <div className="flex items-end gap-2">
                          <button type="submit" disabled={enviando} className="w-full text-xs bg-[#e2f1f6] text-[#427b8f] font-bold rounded-xl py-2 shadow-sm disabled:opacity-50">
                            {enviando ? 'Processando...' : idRefeicaoEditando ? 'Salvar Alteração' : 'Cadastrar na Minha Conta'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-[#edf0ec] shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <h3 className="text-sm font-bold text-[#5a5045]">Meus Lançamentos Privados</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Filtrar dia:</span>
                          <input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)} className="text-xs bg-[#fafaf9] border rounded-lg p-1" />
                        </div>
                      </div>

                      {refeicoesFiltradas.length === 0 ? (
                        <div className="text-center p-6 text-xs text-gray-400">Nenhum alimento cadastrado encontrado nesta data.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b text-gray-400">
                                <th className="pb-2">Horário</th>
                                <th className="pb-2">Tipo</th>
                                <th className="pb-2">Alimento</th>
                                <th className="pb-2">Valor</th>
                                <th className="pb-2 text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {refeicoesFiltradas.map(ref => (
                                <tr key={ref.id} className="border-b hover:bg-gray-50/50">
                                  <td className="py-2">{new Date(ref.data_hora).toLocaleString('pt-BR')}</td>
                                  <td className="py-2"><span className="bg-[#eaf4ec] text-[#56755a] px-2 py-0.5 rounded text-[10px] font-bold">{ref.tipo_refeicao}</span></td>
                                  <td className="py-2 text-[#5a5045] font-medium">{ref.descricao}</td>
                                  <td className="py-2 font-bold text-[#427b8f]">{ref.calorias} kcal</td>
                                  <td className="py-2 text-right space-x-2">
                                    <button onClick={() => prepararEdicao(ref)} className="text-sky-600 hover:underline">Editar</button>
                                    <button onClick={() => handleExcluirRefeicao(ref.id)} className="text-red-500 hover:underline">Excluir</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {abaAtiva === "jejum_gestao" && (
                  <div className="bg-white p-6 rounded-xl border border-[#edf0ec] shadow-sm max-w-xl">
                    <h3 className="text-sm font-bold text-[#5a5045] mb-2">⏱️ Meu Temporizador de Jejum</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#968a7c] mb-1">Selecione seu Protocolo Planejado</label>
                        <select disabled={!!jejumAtivo} value={tipoJejumPlanejado} onChange={e => setTipoJejumPlanejado(e.target.value as TipoJejum)} className="w-full text-xs bg-[#fafaf9] border rounded-xl px-3 py-2">
                          <option value="16:8">Protocolo Padrão 16:8</option>
                          <option value="18:6">Protocolo Avançado 18:6</option>
                          <option value="20:4">Guerreiro 20:4</option>
                          <option value="24h">Completo de 24 horas</option>
                          <option value="Personalizado">Meta Personalizada</option>
                        </select>
                      </div>

                      <div className="p-4 bg-[#fcfbfa] rounded-xl border flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#5a5045]">Status do Meu Ciclo</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {jejumAtivo ? `Seu jejum iniciou em: ${new Date(jejumAtivo.inicio).toLocaleString('pt-BR')}` : 'Nenhum jejum ativo iniciado por você.'}
                          </p>
                        </div>
                        {jejumAtivo ? (
                          <button onClick={handleEncerrarJejum} className="text-xs bg-amber-100 text-amber-800 font-bold px-4 py-2 rounded-xl hover:bg-amber-200 transition-colors">Encerrar e Registrar</button>
                        ) : (
                          <button onClick={handleIniciarJejum} className="text-xs bg-[#eaf4ec] text-[#56755a] font-bold px-4 py-2 rounded-xl hover:bg-[#ddedd2] transition-colors">Iniciar Agora</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {abaAtiva === "historicos" && (
                  <div className="bg-white p-5 rounded-xl border border-[#edf0ec] shadow-sm">
                    <h3 className="text-sm font-bold text-[#5a5045] mb-3">📜 Histórico Pessoal de Jejum Intermitente</h3>
                    {historicoJejum.length === 0 ? (
                      <div className="text-center p-6 text-xs text-gray-400">Nenhum jejum concluído registrado no seu histórico.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b text-gray-400">
                              <th className="pb-2">Momento do Início</th>
                              <th className="pb-2">Momento do Fim</th>
                              <th className="pb-2">Protocolo</th>
                              <th className="pb-2 text-right">Duração Computada</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historicoJejum.map((j: Jejum) => (
                              <tr key={j.id} className="border-b hover:bg-gray-50/50">
                                <td className="py-2">{new Date(j.inicio).toLocaleString('pt-BR')}</td>
                                <td className="py-2">{j.fim ? new Date(j.fim).toLocaleString('pt-BR') : '-'}</td>
                                <td className="py-2"><span className="bg-blue-50 text-[#427b8f] px-2 py-0.5 rounded text-[10px] font-bold">{j.tipo_planejado}</span></td>
                                <td className="py-2 text-right font-bold text-emerald-600">{j.duracao_horas} horas</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
          
        </div>

        <footer className="w-full bg-white border-t py-4 text-center mt-12 shadow-inner">
          <p className="text-[11px] text-[#a1988e] max-w-2xl mx-auto leading-relaxed">
            <strong>⚠️ Aviso de Escopo Acadêmico:</strong> Esta aplicação é um exercício acadêmico e não substitui orientação médica ou nutricional.
          </p>
        </footer>
      </div>
    </div>
  );
}