import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, Check, Loader2, Send } from 'lucide-react';
import { toast } from "sonner"; // Usando o sistema de aviso nativo do Lovable

export default function GeradorDeLink() {
  const [loading, setLoading] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    client_name: '',
    project_name: '',
    price: '',
    material: 'MDF Branco Tx'
  });

  const createLink = async () => {
    if (!formData.client_name || !formData.price) {
      toast.error("Mestre, preencha o nome e o preço!");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
            client_name: formData.client_name,
            project_name: formData.project_name,
            price: parseFloat(formData.price),
            texture_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80',
            status: 'PENDING'
          }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const baseUrl = window.location.origin;
        const projectLink = `${baseUrl}/projeto/${data.id}`;
        const textoZap = `*Showroom MarcenApp* 🪵\n\nOlá, ${formData.client_name}! Seu projeto está pronto:\n\n🔨 *Móvel:* ${formData.project_name}\n💰 *Valor:* R$ ${formData.price}\n\n*Veja em 3D aqui:* 👇\n${projectLink}`;
        
        setWhatsappLink(`https://wa.me/?text=${encodeURIComponent(textoZap)}`);
        toast.success("Link gerado com sucesso!");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao salvar. Verifique se a tabela 'projects' existe no Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
      <div className="flex items-center gap-2 mb-4 text-orange-600 font-bold">
        <Link size={20} />
        <h2>Gerar Link de Cliente</h2>
      </div>

      {!whatsappLink ? (
        <div className="space-y-3">
          <input className="w-full p-3 border rounded-lg bg-slate-50" placeholder="Nome do Cliente" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} />
          <input className="w-full p-3 border rounded-lg bg-slate-50" placeholder="Nome do Projeto" value={formData.project_name} onChange={e => setFormData({...formData, project_name: e.target.value})} />
          <input className="w-full p-3 border rounded-lg bg-slate-50" type="number" placeholder="Valor (R$)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          
          <button onClick={createLink} disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors">
            {loading ? <Loader2 className="animate-spin" /> : "CRIAR LINK"}
          </button>
        </div>
      ) : (
        <div className="text-center animate-in fade-in">
          <div className="bg-green-100 text-green-700 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3"><Check /></div>
          <h3 className="font-bold text-slate-800">Pronto!</h3>
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="block w-full bg-[#25D366] text-white p-3 rounded-lg font-bold mt-4 hover:bg-green-600 transition-colors">
            <Send className="inline mr-2 w-4 h-4" /> ENVIAR NO ZAP
          </a>
          <button onClick={() => setWhatsappLink(null)} className="mt-3 text-xs text-slate-400 underline">Novo Projeto</button>
        </div>
      )}
    </div>
  );
}
