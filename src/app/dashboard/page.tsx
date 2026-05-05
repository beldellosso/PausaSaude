'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Refeicao, Jejum } from '@/types';
import { refeicaoSchema } from '@/lib/validations'; // Certifique-se de criar este arquivo
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Timer, Plus, Utensils, Trash2, Edit3, X, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [meta, setMeta] = useState(2000);
  const [jejumAtivo, setJejumAtivo] = useState<Jejum | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    descricao: '',
    calorias: 0,
    tipo_refeicao: 'Almoço',
    data_hora: new Date().toISOString().slice(0, 16)
  });

  const totalHoje = refeicoes.reduce((acc, curr) => acc + curr.calorias, 0);
  const porcentagem = Math.min((totalHoje / meta) * 100, 100);

  useEffect(() => {
    fetchDados();
  }, [dataFiltro]);

  async function fetchDados() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase.from('perfis').select('meta_calorica').eq('id', user.id).single();
      if (perfil) setMeta(perfil.meta_calorica);

      const { data: logs } = await supabase
        .from('refeicoes')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_hora', `${dataFiltro}T00:00:00`)
        .lte('data_hora', `${dataFiltro}T23:59:59`)
        .order('data_hora', { ascending: true });
      if (logs) setRefeicoes(logs);

      const { data: ativo } = await supabase.from('jejuns').select('*').eq('user_id', user.id).is('fim', null).single();
      setJejumAtivo(ativo);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- CRUD (Requisito 2 + Validação Zod) ---
  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    
    // Validação Client-side (Requisito Não Funcional)
    const validation = refeicaoSchema.safeParse(form);
    if (!validation.success) {
      alert(validation.error.issues[0].message);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = { ...form, user_id: user.id, data_hora: new Date(form.data_hora).toISOString() };

    if (editId) {
      await supabase.from('refeicoes').update(payload).eq('id', editId);
    } else {
      await supabase.from('refeicoes').insert(payload);
    }

    closeModal();
    fetchDados();
  }

  async function handleDeletar(id: string) {
    if (confirm("Deseja excluir este registro?")) {
      await supabase.from('refeicoes').delete().eq('id', id);
      fetchDados();
    }
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setForm({ descricao: '', calorias: 0, tipo_refeicao: 'Almoço', data_hora: new Date().toISOString().slice(0, 16) });
  };

  // --- JEJUM (Requisito 4) ---
  async function toggleJejum() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (jejumAtivo) {
      const agora = new Date();
      const duracao = Math.floor((agora.getTime() - new Date(jejumAtivo.inicio).getTime()) / 1000);
      await supabase.from('jejuns').update({ fim: agora.toISOString(), duracao_segundos: duracao }).eq('id', jejumAtivo.id);
    } else {
      const tipo = prompt("Escolha o tipo (16:8, 18:6, 20:4, 24h):", "16:8");
      await supabase.from('jejuns').insert({ inicio: new Date().toISOString(), tipo_planejado: tipo || '16:8', user_id: user.id });
    }
    fetchDados();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 pb-20 bg-slate-50 min-h-screen">
      
      {/* 1. Meta Diária (Requisito 3) */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consumo Diário</h2>
            <p className="text-4xl font-black text-slate-900">{totalHoje} <span className="text-lg font-normal text-slate-300">/ {meta} kcal</span></p>
          </div>
          <button className="text-blue-600 text-sm font-bold hover:underline">Editar Meta</button>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={totalHoje} aria-valuemin={0} aria-valuemax={meta}>
          <div className={`h-full transition-all duration-700 ${totalHoje > meta ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${porcentagem}%` }} />
        </div>
      </section>

      {/* 2. Jejum (Requisito 4) */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${jejumAtivo ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}><Timer size={28} /></div>
          <div>
            <h3 className="font-bold text-slate-800">Jejum Intermitente</h3>
            <p className="text-sm text-slate-500">{jejumAtivo ? "Jejum em andamento..." : "Nenhum ciclo ativo"}</p>
          </div>
        </div>
        <button onClick={toggleJejum} className={`px-6 py-2 rounded-xl font-bold transition-colors ${jejumAtivo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {jejumAtivo ? 'Encerrar' : 'Iniciar Jejum'}
        </button>
      </section>

      {/* 3. Gráfico (Requisito 6) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[{dia: 'Hoje', calorias: totalHoje}]}>
            <XAxis dataKey="dia" /> <YAxis /> <Tooltip />
            <ReferenceLine y={meta} stroke="#ef4444" strokeDasharray="3 3" label="Meta" />
            <Bar dataKey="calorias" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Lista e Filtro (Requisito 2 + Estados de UI) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="sr-only" htmlFor="filtro-data">Filtrar por data</label>
          <input id="filtro-data" type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Plus size={16} /> Adicionar
          </button>
        </div>

        <div className="grid gap-3">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
          ) : refeicoes.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm italic">Nenhum registro encontrado para esta data.</div>
          ) : (
            refeicoes.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Utensils className="text-slate-300" size={20} aria-hidden="true" />
                  <div>
                    <p className="font-bold text-slate-800">{item.descricao}</p>
                    <p className="text-xs text-slate-400">{item.tipo_refeicao} • {item.calorias} kcal</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button aria-label="Editar registro" onClick={() => { setEditId(item.id!); setForm({...item, data_hora: item.data_hora.slice(0,16)}); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-500"><Edit3 size={18} /></button>
                  <button aria-label="Excluir registro" onClick={() => handleDeletar(item.id!)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL DE CADASTRO (Acessibilidade + Validação) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form onSubmit={handleSalvar} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editId ? 'Editar Refeição' : 'Nova Refeição'}</h3>
              <button type="button" aria-label="Fechar modal" onClick={closeModal}><X size={20} /></button>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="desc" className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
              <input id="desc" required placeholder="Ex: Maçã" className="w-full border-2 border-slate-100 rounded-lg p-2 focus:border-blue-500 outline-none transition-colors" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label htmlFor="cal" className="text-xs font-bold text-slate-500 uppercase">Calorias (kcal)</label>
              <input id="cal" required type="number" className="w-full border-2 border-slate-100 rounded-lg p-2 focus:border-blue-500 outline-none" value={form.calorias} onChange={e => setForm({...form, calorias: Number(e.target.value)})} />
            </div>

            <div className="space-y-1">
              <label htmlFor="tipo" className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
              <select id="tipo" className="w-full border-2 border-slate-100 rounded-lg p-2 focus:border-blue-500 outline-none" value={form.tipo_refeicao} onChange={e => setForm({...form, tipo_refeicao: e.target.value as any})}>
                <option>Café</option><option>Almoço</option><option>Lanche</option><option>Jantar</option><option>Ceia</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="data" className="text-xs font-bold text-slate-500 uppercase">Data e Hora</label>
              <input id="data" type="datetime-local" className="w-full border-2 border-slate-100 rounded-lg p-2 focus:border-blue-500 outline-none" value={form.data_hora} onChange={e => setForm({...form, data_hora: e.target.value})} />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
              {editId ? 'Salvar Alterações' : 'Adicionar Refeição'}
            </button>
          </form>
        </div>
      )}

      <footer className="text-center text-[10px] text-slate-400 pt-10 uppercase tracking-widest border-t border-slate-100">
        <p>A aplicação "Pausa Café & Saúde" é um exercício acadêmico para o Centro Universitário Senac.</p>
        <p>Não substitui orientação médica ou nutricional.</p>
      </footer>
    </div>
  );
}