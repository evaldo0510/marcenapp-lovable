import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Plus, Search, Users, Phone, Mail, MapPin, Trash2, X, Edit3 } from 'lucide-react';

export default function ClientesTab() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);
    const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setClients(data);
    setLoading(false);
  };

  const saveClient = async () => {
    if (!form.name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (editingId) {
      await supabase.from('clients').update(form).eq('id', editingId);
    } else {
      await supabase.from('clients').insert({ ...form, user_id: user.id });
    }
    resetForm();
    loadClients();
  };

  const editClient = (c) => {
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', notes: c.notes || '' });
    setEditingId(c.id);
    setShowForm(true);
  };

  const deleteClient = async (id) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients(clients.filter(c => c.id !== id));
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', address: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const filtered = clients.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col pb-20">
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Clientes</h1>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{clients.length} cadastrados</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="w-11 h-11 bg-[#007AFF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#007AFF]/30 active:scale-90 transition-all">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <Search size={16} className="text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm font-bold">Nenhum cliente encontrado</p>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center">
                  <span className="text-[#007AFF] font-black text-sm">{c.name[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{c.name}</h3>
                  {c.phone && <p className="text-[11px] text-white/40 flex items-center gap-1"><Phone size={10} /> {c.phone}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => editClient(c)} className="p-2 text-white/20 hover:text-blue-400 transition-colors"><Edit3 size={14} /></button>
                <button onClick={() => deleteClient(c.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            {c.email && <p className="text-[11px] text-white/30 flex items-center gap-1 ml-13"><Mail size={10} /> {c.email}</p>}
            {c.address && <p className="text-[11px] text-white/30 flex items-center gap-1 mt-1"><MapPin size={10} /> {c.address}</p>}
            {c.notes && <p className="text-[11px] text-white/20 mt-2 italic">{c.notes}</p>}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-lg bg-[#0f1729] border-t border-white/10 rounded-t-[2rem] p-6 space-y-3" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{editingId ? 'Editar' : 'Novo'} Cliente</h3>
              <button onClick={resetForm} className="p-2 text-white/40"><X size={18} /></button>
            </div>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Telefone" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="E-mail" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Endereço" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Observações" rows={2} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-blue-500 placeholder:text-white/30 resize-none" />
            <button onClick={saveClient} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg">
              {editingId ? 'Atualizar' : 'Salvar'} Cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
