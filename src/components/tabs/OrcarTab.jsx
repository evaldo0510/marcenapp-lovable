import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Plus, Wallet, Trash2, X, Share2, Users, Hammer, ChevronDown } from 'lucide-react';

export default function OrcarTab() {
  const [budgets, setBudgets] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', material_cost: '', labor_cost: '', markup: '2.2', tax_rate: '0.12', client_id: '', project_id: '' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);
    const [bRes, cRes, pRes] = await Promise.all([
      supabase.from('budget_items').select('*, clients(name), projects(project_name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').eq('user_id', user.id).order('name'),
      supabase.from('projects').select('id, project_name').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (bRes.data) setBudgets(bRes.data);
    if (cRes.data) setClients(cRes.data);
    if (pRes.data) setProjects(pRes.data);
    setLoading(false);
  };

  const calcTotal = () => {
    const mat = parseFloat(form.material_cost) || 0;
    const lab = parseFloat(form.labor_cost) || 0;
    const markup = parseFloat(form.markup) || 2.2;
    const tax = parseFloat(form.tax_rate) || 0.12;
    const base = (mat + lab) * markup;
    return base + (base * tax);
  };

  const saveBudget = async () => {
    if (!form.description.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const total = calcTotal();
    await supabase.from('budget_items').insert({
      user_id: user.id, description: form.description,
      material_cost: parseFloat(form.material_cost) || 0, labor_cost: parseFloat(form.labor_cost) || 0,
      markup: parseFloat(form.markup) || 2.2, tax_rate: parseFloat(form.tax_rate) || 0.12,
      total, client_id: form.client_id || null, project_id: form.project_id || null,
    });
    setForm({ description: '', material_cost: '', labor_cost: '', markup: '2.2', tax_rate: '0.12', client_id: '', project_id: '' });
    setShowForm(false);
    loadAll();
  };

  const deleteBudget = async (id) => {
    await supabase.from('budget_items').delete().eq('id', id);
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const shareBudget = (b) => {
    const clientName = b.clients?.name || 'Cliente';
    const projectName = b.projects?.project_name || '';
    const text = `*Orçamento MarcenApp*\n${b.description}${projectName ? `\nObra: ${projectName}` : ''}\nCliente: ${clientName}\nMaterial: R$ ${Number(b.material_cost).toFixed(2)}\nMão de Obra: R$ ${Number(b.labor_cost).toFixed(2)}\n*Total: R$ ${Number(b.total).toFixed(2)}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const totalGeral = budgets.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const inputClass = "w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] placeholder:text-[#1a2a3a]/30";
  const selectClass = "w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] appearance-none";

  return (
    <div className="h-full flex flex-col pb-20 bg-white">
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-[#1a2a3a] tracking-tight">Orçamentos</h1>
            <p className="text-[10px] text-[#1a2a3a]/30 font-bold uppercase tracking-widest">Calculadora Industrial</p>
          </div>
          <button onClick={() => setShowForm(true)} className="w-11 h-11 bg-[#007AFF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#007AFF]/20 active:scale-90 transition-all">
            <Plus size={20} />
          </button>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-[#007AFF] via-[#0066DD] to-[#004BB5] rounded-3xl p-6 mb-4 shadow-xl shadow-[#007AFF]/15">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
          <div className="relative">
            <p className="text-[9px] text-white/60 font-black uppercase tracking-[0.3em] mb-2">Faturamento Total</p>
            <p className="text-3xl font-black text-white tracking-tight">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-white/40 mt-1 font-bold">{budgets.length} orçamento{budgets.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-16">
            <Wallet size={40} className="text-[#007AFF]/15 mx-auto mb-3" />
            <p className="text-[#1a2a3a]/30 text-sm font-bold">Nenhum orçamento ainda</p>
          </div>
        ) : budgets.map(b => (
          <div key={b.id} className="bg-[#007AFF]/[0.03] border border-[#007AFF]/10 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-black text-[#1a2a3a]">{b.description}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {b.clients?.name && (
                    <span className="text-[9px] font-bold text-[#007AFF] bg-[#007AFF]/10 border border-[#007AFF]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Users size={8} /> {b.clients.name}
                    </span>
                  )}
                  {b.projects?.project_name && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Hammer size={8} /> {b.projects.project_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => shareBudget(b)} className="p-2 text-[#1a2a3a]/20 hover:text-emerald-500 transition-colors"><Share2 size={14} /></button>
                <button onClick={() => deleteBudget(b.id)} className="p-2 text-[#1a2a3a]/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#1a2a3a]/[0.03] rounded-xl p-2 text-center">
                <p className="text-[8px] text-[#1a2a3a]/30 font-bold uppercase">Material</p>
                <p className="text-xs font-black text-[#1a2a3a]">R$ {Number(b.material_cost).toFixed(0)}</p>
              </div>
              <div className="bg-[#1a2a3a]/[0.03] rounded-xl p-2 text-center">
                <p className="text-[8px] text-[#1a2a3a]/30 font-bold uppercase">Mão Obra</p>
                <p className="text-xs font-black text-[#1a2a3a]">R$ {Number(b.labor_cost).toFixed(0)}</p>
              </div>
              <div className="bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-xl p-2 text-center">
                <p className="text-[8px] text-[#007AFF] font-bold uppercase">Total</p>
                <p className="text-xs font-black text-[#007AFF]">R$ {Number(b.total).toFixed(0)}</p>
              </div>
            </div>
            <p className="text-[9px] text-[#1a2a3a]/20">{new Date(b.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-lg bg-white border-t border-[#007AFF]/10 rounded-t-[2rem] p-6 space-y-3 max-h-[85vh] overflow-y-auto shadow-2xl" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-[#1a2a3a] uppercase tracking-widest">Novo Orçamento</h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-[#1a2a3a]/30"><X size={18} /></button>
            </div>

            <div className="relative">
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className={selectClass}>
                <option value="">Selecionar cliente (opcional)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a2a3a]/30 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} className={selectClass}>
                <option value="">Vincular a obra (opcional)</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a2a3a]/30 pointer-events-none" />
            </div>

            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição (ex: Cozinha Planejada)" className={inputClass} />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.material_cost} onChange={e => setForm({ ...form, material_cost: e.target.value })} placeholder="Material (R$)" type="number" className={inputClass} />
              <input value={form.labor_cost} onChange={e => setForm({ ...form, labor_cost: e.target.value })} placeholder="Mão de Obra (R$)" type="number" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-[#1a2a3a]/30 font-bold uppercase tracking-widest mb-1 block px-2">Markup</label>
                <input value={form.markup} onChange={e => setForm({ ...form, markup: e.target.value })} type="number" step="0.1" className={inputClass} />
              </div>
              <div>
                <label className="text-[9px] text-[#1a2a3a]/30 font-bold uppercase tracking-widest mb-1 block px-2">Imposto (%)</label>
                <input value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: e.target.value })} type="number" step="0.01" className={inputClass} />
              </div>
            </div>
            <div className="bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-2xl p-4 text-center">
              <p className="text-[9px] text-[#007AFF] font-bold uppercase tracking-widest mb-1">Total Estimado</p>
              <p className="text-2xl font-black text-[#007AFF]">R$ {calcTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <button onClick={saveBudget} className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#007AFF]/20">
              Salvar Orçamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
