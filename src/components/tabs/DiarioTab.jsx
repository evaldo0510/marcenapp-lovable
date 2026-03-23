import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Plus, ClipboardList, Trash2, X, Hammer, Users, Wallet, Sparkles, BookOpen } from 'lucide-react';

const categories = [
  { id: 'geral', label: 'Geral', icon: BookOpen, color: 'text-[#1a2a3a]/40' },
  { id: 'obra', label: 'Obra', icon: Hammer, color: 'text-amber-500' },
  { id: 'cliente', label: 'Cliente', icon: Users, color: 'text-[#007AFF]' },
  { id: 'financeiro', label: 'Financeiro', icon: Wallet, color: 'text-emerald-500' },
  { id: 'ideia', label: 'Ideia', icon: Sparkles, color: 'text-purple-500' },
];

export default function DiarioTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('geral');

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);
    const { data } = await supabase.from('diary_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setEntries(data);
    setLoading(false);
  };

  const saveEntry = async () => {
    if (!content.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('diary_entries').insert({ user_id: user.id, content, category });
    setContent('');
    setCategory('geral');
    setShowForm(false);
    loadEntries();
  };

  const deleteEntry = async (id) => {
    await supabase.from('diary_entries').delete().eq('id', id);
    setEntries(entries.filter(e => e.id !== id));
  };

  const grouped = entries.reduce((acc, e) => {
    const date = new Date(e.created_at).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col pb-20 bg-white">
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-[#1a2a3a] tracking-tight font-['Orbitron',sans-serif]">Diário</h1>
            <p className="text-[10px] text-[#1a2a3a]/30 font-bold uppercase tracking-widest">Registro do Marceneiro</p>
          </div>
          <button onClick={() => setShowForm(true)} className="w-11 h-11 bg-[#007AFF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#007AFF]/20 active:scale-90 transition-all">
            <Plus size={20} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => {
            const count = entries.filter(e => e.category === cat.id).length;
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="shrink-0 bg-[#007AFF]/5 border border-[#007AFF]/10 rounded-2xl px-4 py-2 flex items-center gap-2">
                <Icon size={14} className={cat.color} />
                <span className="text-[10px] font-bold text-[#1a2a3a]/40">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList size={40} className="text-[#007AFF]/15 mx-auto mb-3" />
            <p className="text-[#1a2a3a]/30 text-sm font-bold">Seu diário está vazio</p>
            <p className="text-[#1a2a3a]/15 text-xs mt-1">Comece a registrar seu dia a dia</p>
          </div>
        ) : Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p className="text-[10px] text-[#1a2a3a]/20 font-black uppercase tracking-widest mb-3 capitalize">{date}</p>
            <div className="space-y-2">
              {items.map(e => {
                const cat = categories.find(c => c.id === e.category) || categories[0];
                const Icon = cat.icon;
                const time = new Date(e.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={e.id} className="bg-[#007AFF]/[0.03] border border-[#007AFF]/10 rounded-2xl p-4 flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#007AFF]/5 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={14} className={cat.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1a2a3a]/80 leading-relaxed whitespace-pre-wrap">{e.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${cat.color}`}>{cat.label}</span>
                        <span className="text-[8px] text-[#1a2a3a]/15">•</span>
                        <span className="text-[8px] text-[#1a2a3a]/20">{time}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteEntry(e.id)} className="p-1.5 text-[#1a2a3a]/10 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-lg bg-white border-t border-[#007AFF]/10 rounded-t-[2rem] p-6 space-y-4 shadow-2xl" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-[#1a2a3a] uppercase tracking-widest">Nova Entrada</h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-[#1a2a3a]/30"><X size={18} /></button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} onClick={() => setCategory(cat.id)} className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${category === cat.id ? 'bg-[#007AFF] text-white' : 'bg-[#007AFF]/5 text-[#1a2a3a]/30 border border-[#007AFF]/10'}`}>
                    <Icon size={12} /> {cat.label}
                  </button>
                );
              })}
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="O que aconteceu hoje na oficina?" rows={4} className="w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] placeholder:text-[#1a2a3a]/30 resize-none" />
            <button onClick={saveEntry} className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#007AFF]/20">
              Salvar Entrada
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
