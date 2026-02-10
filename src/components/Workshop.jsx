import React, { useState, useEffect, useRef } from 'react';
import {
  X, Mic, DollarSign, Camera, Send, Loader2, Sparkles, Plus,
  Menu, Image as LucideImage, Brain, Layers, ChevronRight, Zap,
  CheckCircle2, Scissors
} from 'lucide-react';
import { useMarcena } from '../contexts/MarcenaContext';
import { supabase } from '../integrations/supabase/client';

const resizeImage = (base64Str) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 1024;
      let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
      else { if (h > MAX) { w *= MAX / h; h = MAX; } }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

export default function Workshop() {
  const {
    messages, loadingAI, aiStep, activeProjectId, projects,
    updateState, financeiro, notify, projectDNA, industrialRates
  } = useMarcena();

  const [input, setInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [sidebar, setSidebar] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const scrollRef = useRef(null);
  const camRef = useRef(null);
  const galRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loadingAI, preview]);

  // Load projects from DB
  useEffect(() => {
    const loadProjects = async () => {
      const { data } = await supabase.from('projects').select('id, project_name, client_name, status').order('created_at', { ascending: false });
      if (data) updateState('projects', data);
      updateState('isReady', true);
    };
    loadProjects();
  }, [updateState]);

  const runIara = async (txt, img = null) => {
    if (!txt && !img) return;

    const userMsg = {
      id: Date.now(), from: 'user',
      text: txt || '[Scan Industrial]',
      type: img ? 'user-image' : 'text',
      src: img || undefined,
    };
    let history = [...messages, userMsg];
    updateState('messages', history);
    setInput(''); setPreview(null);
    updateState('loadingAI', true);

    try {
      // Step 1: Analyze via edge function
      updateState('aiStep', 'DNA: Extraindo Peças...');
      
      let analyzeBody = { action: 'analyze' };
      if (img) analyzeBody.imageBase64 = img;
      if (txt) analyzeBody.prompt = txt;
      
      // If no image, use chat action instead
      if (!img) {
        analyzeBody = { action: 'chat', prompt: txt };
        const { data: chatData, error: chatError } = await supabase.functions.invoke('iara-pipeline', { body: analyzeBody });
        
        if (chatError) throw chatError;
        
        const chatMsg = { id: Date.now() + 1, from: 'iara', text: chatData?.text || 'Processado.', type: 'text' };
        history = [...history, chatMsg];
        updateState('messages', history);
        updateState('loadingAI', false);
        updateState('aiStep', 'Pronto');
        return;
      }

      const { data: analyzeData, error: analyzeError } = await supabase.functions.invoke('iara-pipeline', { body: analyzeBody });
      if (analyzeError) throw analyzeError;

      const pecas = analyzeData?.project?.pecas || [];
      const comentario = analyzeData?.description || 'DNA Geométrico mapeado.';

      const dnaMsg = { id: Date.now() + 1, from: 'iara', text: comentario, type: 'text' };
      history = [...history, dnaMsg];
      updateState('messages', history);
      updateState('projectDNA', {
        ...projectDNA,
        pecas,
        pricing: { total: analyzeData?.project?.valor_mercado || 0, material: 0 },
        cutPlan: { efficiency: analyzeData?.project?.otimizacao || 85 },
      });

      // Step 2: Calculate budget
      updateState('aiStep', 'ESTELA: Orçando...');
      const area = pecas.reduce((acc, p) =>
        acc + ((p.w || 0) * (p.h || 0) * (p.qtd || 1)) / 1000000, 0);
      const custo = area * (industrialRates.mdf / 5) * 1.35;
      const venda = (custo * industrialRates.markup) * (1 + industrialRates.taxRate);

      const budgetMsg = {
        id: Date.now() + 2, from: 'iara', type: 'status', icon: 'DollarSign',
        text: `Orçamento: R$ ${venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Lucro: R$ ${(venda / (1 + industrialRates.taxRate) - custo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      };
      history = [...history, budgetMsg];
      updateState('messages', history);

      // Step 3: Render 8K
      updateState('aiStep', 'STUDIO: Renderizando 8K...');
      const { data: renderData } = await supabase.functions.invoke('iara-pipeline', {
        body: { action: 'render', imageBase64: img, description: comentario },
      });
      if (renderData?.render) {
        const renderMsg = {
          id: Date.now() + 3, from: 'iara', type: 'render-image',
          text: 'Render 8K Finalizado',
          src: renderData.render,
        };
        history = [...history, renderMsg];
        updateState('messages', history);
      }

      // Save project
      await supabase.from('projects').insert({
        project_name: `Projeto ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        client_name: 'Cliente',
        price: venda,
        status: 'Processando',
      });

    } catch (e) {
      notify('Falha no processamento.');
      console.error(e);
    } finally {
      updateState('loadingAI', false);
      updateState('aiStep', 'Pronto');
    }
  };

  const handleVox = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return notify('Vox indisponível.');
    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.onstart = () => { setIsListening(true); notify('Estou ouvindo...'); };
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => setInput(prev => (prev ? prev + ' ' : '') + e.results[0][0].transcript);
    rec.start();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      notify('Processando Imagem...');
      const reader = new FileReader();
      reader.onloadend = async () => {
        const optimized = await resizeImage(reader.result);
        setPreview(optimized);
        notify('Imagem Pronta!');
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <div className="h-screen flex bg-zinc-950 text-white overflow-hidden font-['Inter',sans-serif]">
      {/* SIDEBAR */}
      <div className={`fixed inset-0 z-50 lg:relative lg:w-80 transition-transform duration-300 ${sidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full w-80 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
          <button onClick={() => setSidebar(false)} className="lg:hidden text-zinc-500 self-end mb-4">
            <X size={20} />
          </button>
          <h3 className="text-xs font-bold text-amber-500 tracking-widest uppercase mb-4">Projetos</h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => { updateState('activeProjectId', p.id); setSidebar(false); }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  activeProjectId === p.id
                    ? 'bg-zinc-800 border-amber-600/50 shadow-xl'
                    : 'border-zinc-800 opacity-50 hover:opacity-80'
                }`}
              >
                <p className="font-bold text-sm">{p.project_name}</p>
                <p className="text-xs text-zinc-500">{p.client_name}</p>
              </button>
            ))}
            {projects.length === 0 && (
              <p className="text-zinc-600 text-sm text-center py-8">Nenhum projeto ainda.</p>
            )}
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 backdrop-blur border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            {!sidebar && (
              <button onClick={() => setSidebar(true)} className="lg:hidden p-2 -ml-2 text-amber-500">
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-sm font-black tracking-tight">
                MARCENA<span className="text-amber-500">PP</span>
              </h1>
              <p className="text-[9px] text-zinc-500 font-bold tracking-widest">POWER ENGINE v550</p>
            </div>
          </div>
          <button className="p-2 bg-white/5 rounded-xl text-emerald-500 active:scale-90 transition-all">
            <Zap size={18} />
          </button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
              <Brain size={48} className="text-amber-500" />
              <p className="text-zinc-400 text-sm font-bold">Pronto para o Scan Industrial</p>
              <button
                onClick={() => camRef.current?.click()}
                className="px-10 py-4 bg-zinc-900 text-white rounded-full font-black uppercase text-xs shadow-2xl active:scale-95 transition-all border border-zinc-700"
              >
                Abrir Câmera
              </button>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`} style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              <div className={`max-w-[85%] rounded-2xl p-3 ${
                m.from === 'user'
                  ? 'bg-amber-600/20 border border-amber-600/30'
                  : 'bg-zinc-800/80 border border-zinc-700/50'
              }`}>
                {m.type === 'user-image' && m.src && (
                  <img src={m.src} alt="Scan" className="w-full rounded-xl mb-2" />
                )}
                {m.type === 'render-image' && m.src && (
                  <div className="relative">
                    <div className="absolute top-2 left-2 bg-emerald-500 text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={10} /> Render Finalizado
                    </div>
                    <img src={m.src} alt="Render 8K" className="w-full rounded-xl" />
                  </div>
                )}
                {m.type === 'status' ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                    {m.icon === 'DollarSign' ? <DollarSign size={16} /> : <Sparkles size={16} />}
                    {m.text}
                  </div>
                ) : (
                  m.text && <p className="text-sm leading-relaxed">{m.text}</p>
                )}
              </div>
            </div>
          ))}

          {loadingAI && (
            <div className="flex items-center gap-3 text-amber-500 text-sm font-bold">
              <Loader2 size={16} className="animate-spin" />
              Yara: {aiStep}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 bg-zinc-900/80 backdrop-blur border-t border-zinc-800 shrink-0">
          {preview && (
            <div className="flex items-center gap-3 mb-3 bg-zinc-800 rounded-xl p-2">
              <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-500">Iara Vision</p>
                <p className="text-[10px] text-zinc-400">Scan pronto. Enviar?</p>
              </div>
              <button onClick={() => setPreview(null)} className="p-2 bg-zinc-700 rounded-full text-zinc-400">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-2xl shadow-lg transition-all border active:scale-90 ${
                isToolsOpen
                  ? 'bg-red-500 rotate-45 text-white border-red-400'
                  : 'bg-zinc-900 border-zinc-700 text-amber-500'
              }`}
            >
              <Plus size={20} />
            </button>

            <div className="flex-1 flex items-center bg-zinc-800 rounded-2xl border border-zinc-700 px-3">
              <input
                ref={galRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
              <input
                ref={camRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFileChange}
                className="hidden"
              />
              <input
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500"
                placeholder="Descreva o móvel..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runIara(input, preview)}
              />
              <div className="flex gap-1">
                <button onClick={() => galRef.current?.click()} className="p-2 text-zinc-500 active:scale-90">
                  <LucideImage size={18} />
                </button>
                <button onClick={() => camRef.current?.click()} className="p-2 text-zinc-500 active:scale-90">
                  <Camera size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={input.trim() || preview ? () => runIara(input, preview) : handleVox}
              className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-2xl shadow-xl transition-all active:scale-95 ${
                input.trim() || preview
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-zinc-800 text-white'
              }`}
            >
              {input.trim() || preview ? <Send size={18} /> : <Mic size={18} />}
            </button>
          </div>
        </div>

        {/* Tools Panel */}
        {isToolsOpen && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setIsToolsOpen(false)} style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div className="w-full bg-zinc-900 rounded-t-3xl p-6 border-t border-zinc-700" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />
              <div className="space-y-2">
                <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all text-left">
                  <Layers size={20} className="text-amber-500" />
                  <span className="font-bold text-sm">Engenharia Bento</span>
                </button>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all text-left">
                  <Scissors size={20} className="text-purple-500" />
                  <span className="font-bold text-sm">Plano de Corte CNC</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Efficiency Bar */}
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 shrink-0">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-500 font-bold">Eficiência Nesting CNC</span>
            <span className="text-amber-500 font-black">{projectDNA.cutPlan.efficiency}%</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${projectDNA.cutPlan.efficiency}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
