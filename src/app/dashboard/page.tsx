'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { ConsumoChart } from './components/ConsumoChart';
import { refeicoesService } from '../../services/refeicoesService';

export default function DashboardPage() {
  const [refeicoes, setRefeicoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarHistorico() {
    try {
      setErro(null);
      const dados = await refeicoesService.listar();
      setRefeicoes(dados || []);
    } catch (err: any) {
      setErro('Não foi possível carregar as refeições recentes.');
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarHistorico();
  }, []);

  const dadosGrafico = refeicoes.map((ref) => ({
    name: ref.descricao.length > 12 ? `${ref.descricao.substring(0, 10)}...` : ref.descricao,
    calorias: ref.calorias,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Monitoramento</h1>
          <p className="text-sm text-gray-400 mt-1">Acompanhe seu consumo energético e histórico diário</p>
        </div>

        {erro && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bloco Esquerdo: Gráfico Recharts */}
            <div className="lg:col-span-2 space-y-4">
              {refeicoes.length === 0 ? (
                <div className="h-64 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                  Nenhuma refeição cadastrada para exibir no gráfico.
                </div>
              ) : (
                <ConsumoChart data={dadosGrafico} />
              )}
            </div>

            {/* Bloco Direito: Histórico de Itens cadastrados */}
            <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex flex-col h-[320px]">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Refeições Lançadas</h3>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {refeicoes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Nenhum registro encontrado.</p>
                ) : (
                  refeicoes.map((ref) => (
                    <div key={ref.id} className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800/60 hover:border-gray-700 transition-colors">
                      <div className="overflow-hidden mr-2">
                        <p className="text-sm font-medium text-gray-200 truncate">{ref.descricao}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-800 text-[10px] text-gray-400 rounded-md font-medium">
                          {ref.tipo_refeicao} {/* Tipo vindo do seu enum do Zod */}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-400 shrink-0">
                        {ref.calorias} kcal
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}