import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Plus, Search, Hammer, Clock, CheckCircle, AlertCircle, Trash2, X } from 'lucide-react';

const statusColors = {
  PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Pendente' },
  IN_PROGRESS: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Em Obra' },
  DONE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Concluído' },
};

export default function PatioTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project_name: '', client_name: '', status: 'PENDING', price: '' });

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);
    const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  };

  const saveProject = async () => {
    if (!form.project_name.trim() || !form.client_name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('projects').insert({
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      user_id: user.id,
    });
    setForm({ project_name: '', client_name: '', status: 'PENDING', price: '' });
    setShowForm(false);
    loadProjects();
  };

  const updateStatus = async (id, status) => {
    await supabase.from('projects').update({ status }).eq('id', id);
    setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
  };

  const deleteProject = async (id) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
  };

  const filtered = projects.filter(p =>
    p.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Pátio</h1>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Gestão de Obras</p>
          </div>
          <button onClick={() => setShowForm(true)} className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 active:scale-90 transition-all">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <Search size={16} className="text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar obra ou cliente..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 px-6 mb-4">
        {Object.entries(statusColors).map(([key, val]) => {
          const count = projects.filter(p => p.status === key).length;
          return (
            <div key={key} className={`flex-1 ${val.bg} border ${val.border} rounded-2xl p-3 text-center`}>
              <p className={`text-lg font-black ${val.text}`}>{count}</p>
              <p className={`text-[8px] font-bold uppercase tracking-widest ${val.text} opacity-70`}>{val.label}</p>
            </div>
          );
        })}
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto px-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Hammer size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm font-bold">Nenhuma obra encontrada</p>
          </div>
        ) : filtered.map(p => {
          const st = statusColors[p.status] || statusColors.PENDING;
          return (
            <div key={p.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-black text-white">{p.project_name}</h3>
                  <p className="text-[11px] text-white/40 font-medium">{p.client_name}</p>
                </div>
                <span className={`${st.bg} ${st.text} border ${st.border} text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full`}>{st.label}</span>
              </div>
              {p.price && <p className="text-blue-400 font-black text-sm">R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
              <div className="flex gap-2">
                {Object.entries(statusColors).map(([key, val]) => (
                  <button key={key} onClick={() => updateStatus(p.id, key)} className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 ${p.status === key ? `${val.bg} ${val.text} border ${val.border}` : 'bg-white/5 text-white/20 border border-white/5'}`}>
                    {val.label}
                  </button>
                ))}
                <button onClick={() => deleteProject(p.id)} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 active:scale-95 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Form */}
      {showForm && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-lg bg-[#0f1729] border-t border-white/10 rounded-t-[2rem] p-6 space-y-4" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Nova Obra</h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-white/40"><X size={18} /></button>
            </div>
            <input value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} placeholder="Nome do projeto" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
            <input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} placeholder="Nome do cliente" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
            <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Valor (R$)" type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
            <button onClick={saveProject} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg">
              Salvar Obra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
