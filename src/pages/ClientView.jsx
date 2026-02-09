import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Certifique-se que esse arquivo existe (o Lovable cria)
import Render3D from '../components/Render3D'; // O componente que criamos antes
import { CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';

export default function ClientView() {
  const { id } = useParams(); // Pega o ID do link
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Busca o projeto no Supabase
  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setProject(data);
      setLoading(false);
    }
    fetchProject();
  }, [id]);

  // Ação: Aprovar
  const handleApprove = async () => {
    await supabase.from('projects').update({ status: 'APPROVED' }).eq('id', id);
    // Abre o WhatsApp do Marceneiro avisando
    window.location.href = `https://wa.me/5511SEUNUMERO?text=Olá! O projeto ${project.project_name} está APROVADO! ✅ Podem começar.`;
  };

  // Ação: Enviar Alteração
  const handleRequestChange = async () => {
    await supabase.from('projects').update({ 
      status: 'CHANGES_REQUESTED',
      feedback: feedbackText 
    }).eq('id', id);
    
    window.location.href = `https://wa.me/5511SEUNUMERO?text=Oi, preciso de uma alteração no projeto ${project.project_name}: ${feedbackText}`;
  };

  if (loading) return <div className="p-10 text-center">Carregando Showroom...</div>;
  if (!project) return <div className="p-10 text-center text-red-500">Projeto não encontrado.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full bg-slate-900 text-white p-6 text-center rounded-b-3xl shadow-lg">
        <h1 className="text-xl font-bold">Olá, {project.client_name}! 👋</h1>
        <p className="text-slate-400 text-sm">Confira seu projeto abaixo</p>
      </div>

      {/* RENDER 3D */}
      <div className="w-full max-w-2xl p-4">
        <Render3D textureUrl={project.texture_url} /> 
      </div>

      {/* DETALHES & AÇÃO */}
      <div className="w-full max-w-md p-6 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] -mt-6 relative z-10 flex-1">
        <div className="flex justify-between items-end mb-6 border-b pb-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Projeto</p>
            <h2 className="text-xl font-black text-slate-800">{project.project_name}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase">Investimento</p>
            <h2 className="text-2xl font-black text-green-600">R$ {project.price}</h2>
          </div>
        </div>

        {/* ÁREA DE STATUS */}
        {project.status === 'APPROVED' ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-xl flex items-center gap-3 font-bold">
            <CheckCircle /> PROJETO APROVADO! 🚀
          </div>
        ) : (
          <div className="space-y-3">
            {!feedbackMode ? (
              <>
                <button 
                  onClick={handleApprove}
                  className="w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle /> APROVAR AGORA
                </button>
                
                <button 
                  onClick={() => setFeedbackMode(true)}
                  className="w-full bg-white border-2 border-slate-200 text-slate-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} /> Solicitar Alteração
                </button>
              </>
            ) : (
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 animate-in fade-in">
                <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-2"><AlertCircle size={16}/> O que devemos mudar?</h3>
                <textarea 
                  className="w-full p-3 rounded-lg border border-orange-200 text-sm"
                  rows={3}
                  placeholder="Ex: Gostaria que a madeira fosse mais escura..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setFeedbackMode(false)} className="flex-1 py-2 text-slate-500 text-sm font-bold">Cancelar</button>
                  <button onClick={handleRequestChange} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-bold text-sm">Enviar Pedido</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
