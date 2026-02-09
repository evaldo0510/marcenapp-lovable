import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client'; // No Lovable o caminho costuma ser esse
import { Link, Copy, Check, Loader2 } from 'lucide-react';

export default function GeradorDeLink() {
  // Estados para guardar o que você digita
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    project_name: '',
    price: '',
  });

  // Função que faz a mágica
  const createLink = async () => {
    if (!formData.client_name || !formData.price) {
      alert("Mestre, preencha o nome e o preço!");
      return;
    }

    setLoading(true);

    // 1. Cria o projeto no Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert([
        { 
          client_name: formData.client_name,
          project_name: formData.project_name,
          price: parseFloat(formData.price),
          texture_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80', // Textura padrão de madeira
          status: 'PENDING'
        }
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error('Erro:', error);
      alert("Erro ao criar projeto. Veja o console.");
      return;
    }

    if (data) {
      // 2. Gera o Link
      const link = `${window.location.origin}/projeto/${data.id}`;
      
      // 3. Copia e Avisa
      navigator.clipboard.writeText(link);
      
      // Feedback visual
      alert(`✅ Link Gerado e Copiado!\n\nMande para o cliente:\n${link}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 max-w-md mx-auto mt-10">
      <div className="flex items-center gap-3 mb-6 text-orange-600">
        <Link size={24} />
        <h2 className="text-xl font-bold text-slate-800">Novo Projeto</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Cliente</label>
          <input 
            type="text" 
            placeholder="Ex: Dona Maria"
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-orange-500 outline-none"
            value={formData.client_name}
            onChange={(e) => setFormData({...formData, client_name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Projeto</label>
          <input 
            type="text" 
            placeholder="Ex: Cozinha Planejada"
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-orange-500 outline-none"
            value={formData.project_name}
            onChange={(e) => setFormData({...formData, project_name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
          <input 
            type="number" 
            placeholder="0.00"
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-orange-500 outline-none"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
        </div>

        <button 
          onClick={createLink} 
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Copy size={20} />}
          {loading ? "Gerando..." : "GERAR LINK DO CLIENTE"}
        </button>
      </div>
    </div>
  );
}
