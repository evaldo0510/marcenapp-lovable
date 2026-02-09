import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client'; // Ajuste o caminho se necessário no Lovable
import { Link, Copy, Check, Loader2, Send } from 'lucide-react';

export default function GeradorDeLink() {
  const [loading, setLoading] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState(null); // Novo estado para guardar o link
  
  const [formData, setFormData] = useState({
    client_name: '',
    project_name: '',
    price: '',
    material: 'MDF Branco Tx' // Valor padrão para não dar "undefined"
  });

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
          texture_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80',
          status: 'PENDING'
        }
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("Erro ao salvar. Veja o console.");
      console.error(error);
      return;
    }

    if (data) {
      // 2. Monta o Link do Projeto (Showroom)
      const projectLink = `${window.location.origin}/projeto/${data.id}`;
      
      // 3. Monta o Texto Bonito do WhatsApp
      const textoZap = `*Showroom MarcenApp* 🪵\n\nOlá, ${formData.client_name}! Confira o seu novo projeto fotorrealista:\n\n🔨 *Móvel:* ${formData.project_name}\n🎨 *Acabamento:* ${formData.material}\n💰 *Valor Sugerido:* R$ ${formData.price}\n\n*Clique para ver em 3D e Aprovar:* 👇\n${projectLink}`;
      
      // 4. Cria o Link do Zap (codificado para não quebrar)
      const linkFinal = `https://wa.me/?text=${encodeURIComponent(textoZap)}`;
      
      setWhatsappLink(linkFinal); // Salva o link e libera o botão verde
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 max-w-md mx-auto mt-10">
      <div className="flex items-center gap-3 mb-6 text-orange-600">
        <Link size={24} />
        <h2 className="text-xl font-bold text-slate-800">Novo Projeto</h2>
      </div>

      {!whatsappLink ? (
        /* --- ESTADO 1: FORMULÁRIO --- */
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Móvel / Projeto</label>
            <input 
              type="text" 
              placeholder="Ex: Guarda-Roupa"
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-orange-500 outline-none"
              value={formData.project_name}
              onChange={(e) => setFormData({...formData, project_name: e.target.value})}
            />
          </div>

           <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Acabamento/Material</label>
            <input 
              type="text" 
              placeholder="Ex: MDF Louro Freijó"
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-orange-500 outline-none"
              value={formData.material}
              onChange={(e) => setFormData({...formData, material: e.target.value})}
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
            className="w-full bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Link size={20} />}
            {loading ? "Gerando Showroom..." : "GERAR PROJETO"}
          </button>
        </div>
      ) : (
        /* --- ESTADO 2: PRONTO PARA ENVIAR (Sem Bloqueio) --- */
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="bg-green-100 text-green-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Tudo Pronto!</h3>
          <p className="text-slate-500 mb-6 text-sm">O link do showroom foi criado. Clique abaixo para abrir o WhatsApp.</p>
          
          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200/50 transition-transform hover:scale-105"
          >
            <Send size={24} />
            ENVIAR NO WHATSAPP
          </a>

          <button 
            onClick={() => { setWhatsappLink(null); setFormData({...formData, client_name: ''}); }}
            className="mt-4 text-slate-400 text-xs hover:text-slate-600 underline"
          >
            Criar novo projeto
          </button>
        </div>
      )}
    </div>
  );
}
