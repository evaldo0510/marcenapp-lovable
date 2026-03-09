import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Plus, Search, Hammer, Trash2, X, Users, Phone, Mail, MapPin, Edit3 } from 'lucide-react';

const statusColors = {
  PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', label: 'Pendente' },
  IN_PROGRESS: { bg: 'bg-[#007AFF]/10', text: 'text-[#007AFF]', border: 'border-[#007AFF]/20', label: 'Em Obra' },
  DONE: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', label: 'Concluído' },
};

export default function PatioTab() {
  const [section, setSection] = useState('obras');
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ project_name: '', client_name: '', status: 'PENDING', price: '' });
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [editingClientId, setEditingClientId] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);
    const [projRes, cliRes] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (projRes.data) setProjects(projRes.data);
    if (cliRes.data) setClients(cliRes.data);
    setLoading(false);
  };

  const saveProject = async () => {
    if (!projectForm.project_name.trim() || !projectForm.client_name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('projects').insert({ ...projectForm, price: projectForm.price ? parseFloat(projectForm.price) : null, user_id: user.id });
    setProjectForm({ project_name: '', client_name: '', status: 'PENDING', price: '' });
    setShowForm(false);
    loadData();
  };

  const saveClient = async () => {
    if (!clientForm.name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (editingClientId) {
      await supabase.from('clients').update(clientForm).eq('id', editingClientId);
    } else {
      await supabase.from('clients').insert({ ...clientForm, user_id: user.id });
    }
    setClientForm({ name: '', phone: '', email: '', address: '', notes: '' });
    setEditingClientId(null);
    setShowForm(false);
    loadData();
  };

  const updateStatus = async (id, status) => {
    await supabase.from('projects').update({ status }).eq('id', id);
    setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
  };

  const deleteProject = async (id) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
  };

  const deleteClient = async (id) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients(clients.filter(c => c.id !== id));
  };

  const editClient = (c) => {
    setClientForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', notes: c.notes || '' });
    setEditingClientId(c.id);
    setShowForm(true);
  };

  const filteredProjects = projects.filter(p =>
    p.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredClients = clients.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col pb-20 bg-white">
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-[#1a2a3a] tracking-tight font-['Orbitron',sans-serif]">Pátio</h1>
            <p className="text-[10px] text-[#1a2a3a]/30 font-bold uppercase tracking-widest">Gestão de Obras & Clientes</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingClientId(null); setClientForm({ name: '', phone: '', email: '', address: '', notes: '' }); }}
            className="w-11 h-11 bg-[#007AFF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#007AFF]/20 active:scale-90 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex bg-[#007AFF]/5 rounded-2xl p-1 mb-4 border border-[#007AFF]/10">
          <button
            onClick={() => setSection('obras')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              section === 'obras' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-[#1a2a3a]/40'
            }`}
          >
            <Hammer size={14} /> Obras
          </button>
          <button
            onClick={() => setSection('clientes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              section === 'clientes' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-[#1a2a3a]/40'
            }`}
          >
            <Users size={14} /> Clientes ({clients.length})
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[#007AFF]/5 border border-[#007AFF]/10 rounded-2xl px-4 py-3">
          <Search size={16} className="text-[#007AFF]/30" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={section === 'obras' ? "Buscar obra ou cliente..." : "Buscar cliente..."}
            className="flex-1 bg-transparent text-[#1a2a3a] text-sm outline-none placeholder:text-[#1a2a3a]/30"
          />
        </div>
      </div>

      {section === 'obras' && (
        <>
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

          <div className="flex-1 overflow-y-auto px-6 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <Hammer size={40} className="text-[#007AFF]/15 mx-auto mb-3" />
                <p className="text-[#1a2a3a]/30 text-sm font-bold">Nenhuma obra encontrada</p>
              </div>
            ) : filteredProjects.map(p => {
              const st = statusColors[p.status] || statusColors.PENDING;
              return (
                <div key={p.id} className="bg-[#007AFF]/[0.03] border border-[#007AFF]/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-[#1a2a3a]">{p.project_name}</h3>
                      <p className="text-[11px] text-[#1a2a3a]/40 font-medium">{p.client_name}</p>
                    </div>
                    <span className={`${st.bg} ${st.text} border ${st.border} text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full`}>{st.label}</span>
                  </div>
                  {p.price && <p className="text-[#007AFF] font-black text-sm">R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>}
                  <div className="flex gap-2">
                    {Object.entries(statusColors).map(([key, val]) => (
                      <button key={key} onClick={() => updateStatus(p.id, key)} className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 ${p.status === key ? `${val.bg} ${val.text} border ${val.border}` : 'bg-[#1a2a3a]/5 text-[#1a2a3a]/20 border border-[#1a2a3a]/5'}`}>
                        {val.label}
                      </button>
                    ))}
                    <button onClick={() => deleteProject(p.id)} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 active:scale-95 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {section === 'clientes' && (
        <div className="flex-1 overflow-y-auto px-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-16">
              <Users size={40} className="text-[#007AFF]/15 mx-auto mb-3" />
              <p className="text-[#1a2a3a]/30 text-sm font-bold">Nenhum cliente encontrado</p>
            </div>
          ) : filteredClients.map(c => (
            <div key={c.id} className="bg-[#007AFF]/[0.03] border border-[#007AFF]/10 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center">
                    <span className="text-[#007AFF] font-black text-sm">{c.name[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1a2a3a]">{c.name}</h3>
                    {c.phone && <p className="text-[11px] text-[#1a2a3a]/40 flex items-center gap-1"><Phone size={10} /> {c.phone}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editClient(c)} className="p-2 text-[#1a2a3a]/20 hover:text-[#007AFF] transition-colors"><Edit3 size={14} /></button>
                  <button onClick={() => deleteClient(c.id)} className="p-2 text-[#1a2a3a]/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              {c.email && <p className="text-[11px] text-[#1a2a3a]/30 flex items-center gap-1 ml-13"><Mail size={10} /> {c.email}</p>}
              {c.address && <p className="text-[11px] text-[#1a2a3a]/30 flex items-center gap-1 mt-1"><MapPin size={10} /> {c.address}</p>}
              {c.notes && <p className="text-[11px] text-[#1a2a3a]/20 mt-2 italic">{c.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-lg bg-white border-t border-[#007AFF]/10 rounded-t-[2rem] p-6 space-y-3 shadow-2xl" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            {section === 'obras' ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-[#1a2a3a] uppercase tracking-widest">Nova Obra</h3>
                  <button onClick={() => setShowForm(false)} className="p-2 text-[#1a2a3a]/30"><X size={18} /></button>
                </div>
                <input value={projectForm.project_name} onChange={e => setProjectForm({ ...projectForm, project_name: e.target.value })} placeholder="Nome do projeto" className="w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] placeholder:text-[#1a2a3a]/30" />
                <input value={projectForm.client_name} onChange={e => setProjectForm({ ...projectForm, client_name: e.target.value })} placeholder="Nome do cliente" className="w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] placeholder:text-[#1a2a3a]/30" />
                <input value={projectForm.price} onChange={e => setProjectForm({ ...projectForm, price: e.target.value })} placeholder="Valor (R$)" type="number" className="w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] placeholder:text-[#1a2a3a]/30" />
                <button onClick={saveProject} className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#007AFF]/20">
                  Salvar Obra
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-[#1a2a3a] uppercase tracking-widest">{editingClientId ? 'Editar' : 'Novo'} Cliente</h3>
                  <button onClick={() => { setShowForm(false); setEditingClientId(null); }} className="p-2 text-[#1a2a3a]/30"><X size={18} /></button>
                </div>
                <input value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} placeholder="Nome completo" className="w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] placeholder:text-[#1a2a3a]/30" />
                <input value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} placeholder="Telefone" className="w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] placeholder:text-[#1a2a3a]/30" />
                <input value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} placeholder="E-mail" className="w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] placeholder:text-[#1a2a3a]/30" />
                <input value={clientForm.address} onChange={e => setClientForm({ ...clientForm, address: e.target.value })} placeholder="Endereço" className="w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] placeholder:text-[#1a2a3a]/30" />
                <textarea value={clientForm.notes} onChange={e => setClientForm({ ...clientForm, notes: e.target.value })} placeholder="Observações" rows={2} className="w-full bg-[#007AFF]/5 border border-[#007AFF]/15 rounded-2xl px-5 py-3.5 text-sm text-[#1a2a3a] outline-none focus:border-[#007AFF] placeholder:text-[#1a2a3a]/30 resize-none" />
                <button onClick={saveClient} className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#007AFF]/20">
                  {editingClientId ? 'Atualizar' : 'Salvar'} Cliente
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
