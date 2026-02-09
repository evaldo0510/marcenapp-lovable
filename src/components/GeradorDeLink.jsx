import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client'; // Caminho padrão do Lovable
import { Link, Copy, Check, Loader2, Send } from 'lucide-react';

export default function GeradorDeLink() {
  const [loading, setLoading] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState(null);
  
  const [formData, setFormData] = useState({
    client_name: '',
    project_name: '',
    price: '',
    material: 'MDF Branco Tx'
  });

  const createLink = async () => {
    // Validação básica
    if (!formData.client_name || !formData.price) {
      alert("Mestre, preencha o nome e o preço!");
      return;
    }

    setLoading(true);

    try {
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

      if (error) throw error;

      if (data) {
        // 2. Monta o Link do Projeto
        const baseUrl = window.location.origin;
        const projectLink = `${baseUrl}/projeto/${data.id}`;
        
        // 3. Texto do WhatsApp
        const textoZap = `*Showroom MarcenApp* 🪵\n\nOlá, ${formData.client_name}! Confira o seu novo projeto fotorrealista:\n\n🔨 *Móvel:* ${formData.project_name}\n🎨 *Acabamento:* ${formData.material}\n💰 *Valor Sugerido:* R$ ${formData.price}\n\n*Clique para ver em 3D e Aprovar:* 👇\n${projectLink}`;
        
        // 4. Cria o Link do Zap (codificado para evitar erros)
        const linkFinal = `https://wa.me/?text=${encodeURIComponent(textoZap)}`;
        
        // Salva e libera o botão verde
        setWhatsappLink(linkFinal);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com o banco. Verifique se a tabela 'projects' existe no Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden">
      {/* Cabeçalho do Card */}
      <div className="bg-slate-50 p-6 border-b border-slate-100">
        <h2 className="flex items-center gap-2 text-xl font-bold text-orange-600">
          <Link size={24} />
          Novo Projeto
        </h2>
      </div>

      <div className="p-6">
        {!whatsappLink ? (
          /* --- ESTADO 1: FORMULÁRIO DE CRIAÇÃO --- */
          <div className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nome do Cliente</label>
              <input 
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="Ex: Dona Maria"
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Móvel / Projeto</label>
              <input 
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="Ex: Guarda-Roupa"
                value={formData.project_name}
                onChange={(e) => setFormData({...formData, project_name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Acabamento</label>
              <input 
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="Ex: MDF Freijó"
                value={formData.material}
                onChange={(e) => setFormData({...formData, material: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
              <input 
                type="number"
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <button 
              onClick={createLink} 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Link size={18} />}
              {loading ? "Processando..." : "GERAR LINK"}
            </button>
          </div>
        ) : (
          /* --- ESTADO 2: PRONTO PARA ENVIAR (BOTÃO VERDE) --- */
          <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Sucesso!</h3>
            <p className="text-slate-500 mb-6 text-sm">O link do Showroom foi criado.</p>
            
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <Send className="mr-2" size={20} />
              ENVIAR NO WHATSAPP
            </a>

            <button 
              onClick={() => { setWhatsappLink(null); setFormData({...formData, client_name: ''}); }}
              className="mt-6 text-sm text-slate-400 hover:text-slate-600 hover:underline"
            >
              Criar novo projeto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
