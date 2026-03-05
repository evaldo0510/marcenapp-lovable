import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Plus, Wallet, Calculator, Trash2, X, DollarSign, Layers, Share2 } from 'lucide-react';

export default function OrcarTab() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', material_cost: '', labor_cost: '', markup: '2.2', tax_rate: '0.12' });

  useEffect(() => { loadBudgets(); }, []);

  const loadBudgets = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);
    const { data } = await supabase.from('budget_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setBudgets(data);
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
      user_id: user.id,
      description: form.description,
      material_cost: parseFloat(form.material_cost) || 0,
      labor_cost: parseFloat(form.labor_cost) || 0,
      markup: parseFloat(form.markup) || 2.2,
      tax_rate: parseFloat(form.tax_rate) || 0.12,
      total,
    });
    setForm({ description: '', material_cost: '', labor_cost: '', markup: '2.2', tax_rate: '0.12' });
    setShowForm(false);
    loadBudgets();
  };

  const deleteBudget = async (id) => {
    await supabase.from('budget_items').delete().eq('id', id);
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const shareBudget = (b) => {
    const text = `*Orçamento MarcenApp*\n${b.description}\nMaterial: R$ ${Number(b.material_cost).toFixed(2)}\nMão de Obra: R$ ${Number(b.labor_cost).toFixed(2)}\n*Total: R$ ${Number(b.total).toFixed(2)}*`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const totalGeral = budgets.reduce((sum, b) => sum + Number(b.total || 0), 0);

  return (
    <div className="h-full flex flex-col pb-20">
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Orçamentos</h1>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Calculadora Industrial</p>
          </div>
          <button onClick={() => setShowForm(true)} className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 active:scale-90 transition-all">
            <Plus size={20} />
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/20 rounded-2xl p-5 mb-4">
          <p className="text-[9px] text-blue-300 font-black uppercase tracking-widest mb-1">Faturamento Total</p>
          <p className="text-3xl font-black text-white">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-blue-300/60 mt-1">{budgets.length} orçamentos</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-16">
            <Wallet size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm font-bold">Nenhum orçamento ainda</p>
          </div>
        ) : budgets.map(b => (
          <div key={b.id} className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-black text-white flex-1">{b.description}</h3>
              <div className="flex gap-1">
                <button onClick={() => shareBudget(b)} className="p-2 text-white/20 hover:text-emerald-400 transition-colors"><Share2 size={14} /></button>
                <button onClick={() => deleteBudget(b.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white/5 rounded-xl p-2 text-center">
                <p className="text-[8px] text-white/30 font-bold uppercase">Material</p>
                <p className="text-xs font-black text-white">R$ {Number(b.material_cost).toFixed(0)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2 text-center">
                <p className="text-[8px] text-white/30 font-bold uppercase">Mão Obra</p>
                <p className="text-xs font-black text-white">R$ {Number(b.labor_cost).toFixed(0)}</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2 text-center">
                <p className="text-[8px] text-blue-300 font-bold uppercase">Total</p>
                <p className="text-xs font-black text-blue-400">R$ {Number(b.total).toFixed(0)}</p>
              </div>
            </div>
            <p className="text-[9px] text-white/20">{new Date(b.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-lg bg-[#0f1729] border-t border-white/10 rounded-t-[2rem] p-6 space-y-3" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Novo Orçamento</h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-white/40"><X size={18} /></button>
            </div>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição (ex: Cozinha Planejada)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.material_cost} onChange={e => setForm({ ...form, material_cost: e.target.value })} placeholder="Material (R$)" type="number" className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
              <input value={form.labor_cost} onChange={e => setForm({ ...form, labor_cost: e.target.value })} placeholder="Mão de Obra (R$)" type="number" className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-1 block px-2">Markup</label>
                <input value={form.markup} onChange={e => setForm({ ...form, markup: e.target.value })} type="number" step="0.1" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-1 block px-2">Imposto (%)</label>
                <input value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: e.target.value })} type="number" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500" />
              </div>
            </div>
            {/* Live Preview */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
              <p className="text-[9px] text-blue-300 font-bold uppercase tracking-widest mb-1">Total Estimado</p>
              <p className="text-2xl font-black text-blue-400">R$ {calcTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <button onClick={saveBudget} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg">
              Salvar Orçamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
