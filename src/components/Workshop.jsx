import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, Download, Loader2, 
  Pencil, Eraser, Trash2, 
  Check, Save, RotateCcw, Share2, Image as ImageIcon,
  Zap, ArrowRight, ShieldAlert, ZoomIn, ZoomOut, Wand2,
  PenTool, Eye, EyeOff, MapPin, Send, Trash, Hand,
  LogOut, GalleryHorizontalEnd, Mic, MicOff, X, Settings, Volume2, VolumeX
} from 'lucide-react';
import useVoiceControl from '../hooks/useVoiceControl';
import { supabase } from '../integrations/supabase/client';
import Gallery from './Gallery';
import BottomNav from './BottomNav';
import SettingsPanel from './SettingsPanel';
import ChatBubble from './ChatBubble';
import MaskEditor from './MaskEditor';
import UploadPreview from './UploadPreview';
import ImageInspector from './ImageInspector';
import PatioTab from './tabs/PatioTab';
import ClientesTab from './tabs/ClientesTab';
import OrcarTab from './tabs/OrcarTab';
import DiarioTab from './tabs/DiarioTab';
import FeedbackNotification from './FeedbackNotification';

const Logo = ({ size = "normal" }) => {
  const s = size === "small" ? "w-8 h-8" : "w-20 h-20";
  return (
    <div className={`${s} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
        <circle cx="50" cy="50" r="8" fill="#3b82f6" />
      </svg>
    </div>
  );
};

export default function Workshop() {
  // --- GLOBAL ---
  const [activeTab, setActiveTab] = useState('iara');
  const [isBooting, setIsBooting] = useState(true);
  const [systemStatus, setSystemStatus] = useState("DESPERTANDO IARA...");

  // --- IARA STUDIO ---
  const [step, setStep] = useState('upload');
  const [photo, setPhoto] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("TECENDO REALIDADE...");
  const [error, setError] = useState(null);
  const [showResultUI, setShowResultUI] = useState(true);
  const [showFullEnvironment, setShowFullEnvironment] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // --- PINS ---
  const [pins, setPins] = useState([]);
  const [activePinId, setActivePinId] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // --- DRAWING ---
  const [isEraser, setIsEraser] = useState(false);
  const [brushSize] = useState(6);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [zoomScale, setZoomScale] = useState(1);
  const [prompt, setPrompt] = useState("");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- MODALS ---
  const [uploadPreviewData, setUploadPreviewData] = useState(null);
  const [maskEditorData, setMaskEditorData] = useState(null);
  const [inspectorData, setInspectorData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // --- CHAT ---
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef(null);
  const voice = useVoiceControl();
  // --- BOOT ---
  useEffect(() => {
    const init = async () => {
      setSystemStatus("CALIBRANDO SENSORES...");
      await new Promise(r => setTimeout(r, 600));
      setSystemStatus("ESTABILIZANDO VISOR...");
      await new Promise(r => setTimeout(r, 400));
      setIsBooting(false);
    };
    init();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chatLoading]);

  // --- UTILS ---
  const getCoords = useCallback((e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
    const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  }, []);

  const undo = useCallback(() => {
    if (canvasHistory.length === 0) return;
    const newHistory = [...canvasHistory];
    newHistory.pop();
    setCanvasHistory(newHistory);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (newHistory.length > 0) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = newHistory[newHistory.length - 1];
    }
  }, [canvasHistory]);

  const timeStr = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const resetAll = useCallback(() => {
    setStep('upload');
    setPhoto(null);
    setGeneratedImage(null);
    setPrompt("");
    setPins([]);
    setCanvasHistory([]);
    setZoomScale(1);
    setError(null);
    setShowResultUI(true);
    setActivePinId(null);
    setIsInspecting(false);
    setIsRefining(false);
    setPanPosition({ x: 0, y: 0 });
    setShowFullEnvironment(false);
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setUploadPreviewData(base64);
    };
    reader.onerror = () => setError("Erro ao ler ficheiro.");
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => fileInputRef.current?.click();

  // --- DRAWING ---
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? "white" : "#0f172a";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.lineWidth = brushSize * 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) setCanvasHistory(prev => [...prev, canvasRef.current.toDataURL()]);
  };

  // --- PAN/ZOOM ---
  const handleMouseDown = (e) => {
    if (!isInspecting || isRefining) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - panPosition.x, y: clientY - panPosition.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPanPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleImageClick = (e) => {
    if (step !== 'result' || isDragging) return;
    if (activePinId !== null) { setActivePinId(null); setIsRefining(false); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const xPerc = ((e.clientX - rect.left) / rect.width) * 100;
    const yPerc = ((e.clientY - rect.top) / rect.height) * 100;
    if (!isInspecting) {
      setIsInspecting(true);
      setShowResultUI(false);
      setPanPosition({ x: (window.innerWidth / 2) - e.clientX, y: (window.innerHeight / 2) - e.clientY });
      const newPin = { id: Date.now(), x: xPerc, y: yPerc, prompt: "" };
      setPins([newPin]);
      setActivePinId(newPin.id);
      setIsRefining(true);
    } else {
      const newPin = { id: Date.now(), x: xPerc, y: yPerc, prompt: "" };
      setPins([...pins, newPin]);
      setActivePinId(newPin.id);
      setIsRefining(true);
    }
  };

  const updatePinPrompt = (id, text) => setPins(pins.map(p => p.id === id ? { ...p, prompt: text } : p));
  const removePin = (id) => { setPins(pins.filter(p => p.id !== id)); setActivePinId(null); setIsRefining(false); };
  const savePin = () => { setActivePinId(null); setIsRefining(false); };
  const cancelInspection = () => {
    setIsInspecting(false); setIsRefining(false); setActivePinId(null);
    setPins([]); setPanPosition({ x: 0, y: 0 }); setShowResultUI(true);
  };

  // --- MOTOR ALQUÍMICO ---
  const generateRender = async (mode = 'initial') => {
    setLoading(true);
    setLoadingText(mode === 'refine' ? "UNINDO INTENÇÕES..." : mode === 'multi' ? "GERANDO MULTI-VISTA..." : "MATERIALIZANDO PROJETO...");
    setError(null);
    try {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = 1920; finalCanvas.height = 1080;
      const fCtx = finalCanvas.getContext('2d');
      const photoImg = new Image();
      photoImg.crossOrigin = "anonymous";
      photoImg.src = mode === 'refine' || mode === 'multi' ? generatedImage : photo;
      await new Promise((resolve, reject) => { photoImg.onload = resolve; photoImg.onerror = () => reject(new Error("Erro ao carregar imagem.")); });
      const scale = Math.min(1920 / photoImg.width, 1080 / photoImg.height);
      const x = (1920 - photoImg.width * scale) / 2;
      const y = (1080 - photoImg.height * scale) / 2;
      fCtx.fillStyle = "black"; fCtx.fillRect(0, 0, 1920, 1080);
      fCtx.drawImage(photoImg, x, y, photoImg.width * scale, photoImg.height * scale);
      if (mode === 'initial' && canvasRef.current) fCtx.drawImage(canvasRef.current, 0, 0, 1920, 1080);
      const inputDataUrl = finalCanvas.toDataURL('image/png');

      if (mode === 'multi') {
        // Multi-Vista: gerar portas abertas e fechadas
        const views = [
          { label: "VISTA PORTAS ABERTAS", desc: "Show all doors/drawers open. DO NOT change furniture structure." },
          { label: "VISTA PORTAS FECHADAS", desc: "Ensure all doors and drawers are closed perfectly. Geometry matches sketch 1:1." }
        ];
        for (const view of views) {
          const { data } = await supabase.functions.invoke('iara-pipeline', {
            body: { action: 'render', imageBase64: inputDataUrl, description: `100% STRUCTURAL FIDELITY. ${view.desc} 8K Realistic.` }
          });
          if (data?.render) {
            const url = data.render.startsWith('data:') ? data.render : `data:image/png;base64,${data.render}`;
            const msg = { id: Date.now() + Math.random(), from: 'iara', text: view.label, type: 'image', src: url, time: timeStr() };
            setMessages(prev => [...prev, msg]);
            // Save each view
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await supabase.from('renders').insert({ user_id: user.id, image_url: url, prompt: view.label });
          }
        }
      } else {
        const multiPrompt = pins.filter(p => p.prompt.trim()).map(p => `[x:${p.x.toFixed(1)}%, y:${p.y.toFixed(1)}%]: ${p.prompt}`).join("; ");
        const description = mode === 'refine'
          ? `TECHNICAL RECONFIGURATION. ORDERS: "${multiPrompt}". QUALITY: Photorealistic 8K.`
          : `100% FAITHFUL SKETCH MATERIALIZATION. ${prompt || 'MDF premium finish'}. 8K Realistic.`;

        const { data, error: fnError } = await supabase.functions.invoke('iara-pipeline', {
          body: { action: 'render', imageBase64: inputDataUrl, description }
        });
        if (fnError) throw fnError;
        if (data?.render) {
          const imageUrl = data.render.startsWith('data:') ? data.render : `data:image/png;base64,${data.render}`;
          setGeneratedImage(imageUrl);
          setStep('result');
          setIsInspecting(false); setPins([]); setActivePinId(null); setIsRefining(false);
          setPanPosition({ x: 0, y: 0 }); setShowResultUI(true);
          // Add to chat
          const iaraMsg = { id: Date.now(), from: 'iara', text: "Materialização concluída. Toque para inspecionar.", type: 'image', src: imageUrl, time: timeStr() };
          setMessages(prev => [...prev, iaraMsg]);
          // Save to DB
          const { data: { user } } = await supabase.auth.getUser();
          if (user) await supabase.from('renders').insert({ user_id: user.id, image_url: imageUrl, prompt: description });
        } else {
          throw new Error(data?.error || "Falha na materialização.");
        }
      }
    } catch (e) {
      setError(String(e.message || "Erro desconhecido."));
    } finally {
      setLoading(false);
    }
  };

  // --- CHAT ---
  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text && !generatedImage) return;
    setChatInput('');
    const userMsg = { id: Date.now(), from: 'user', text: text || 'Análise técnica', type: 'text', time: timeStr() };
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('iara-pipeline', {
        body: { action: 'chat', prompt: text, imageBase64: generatedImage || null }
      });
      if (fnError) throw fnError;
      const iaraMsg = { id: Date.now() + 1, from: 'iara', text: data?.text || 'Erro operacional.', type: 'text', time: timeStr() };
      setMessages(prev => [...prev, iaraMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'iara', text: 'Erro no processamento.', type: 'text', time: timeStr() }]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- MODAL HANDLERS ---
  const handleUploadPreviewConfirm = (caption) => {
    setPhoto(uploadPreviewData);
    setPrompt(caption);
    setUploadPreviewData(null);
    setStep('sketch');
  };

  const handleInspectorEdit = (imgSrc) => {
    setInspectorData(null);
    setMaskEditorData(imgSrc);
  };

  const handleInspectorMultiView = (imgSrc) => {
    setInspectorData(null);
    generateRender('multi');
  };

  const handleMaskConfirm = (maskBase64) => {
    setMaskEditorData(null);
    // Use mask to refine
    setLoading(true);
    setLoadingText("APLICANDO ÂNCORAS...");
    (async () => {
      try {
        const { data } = await supabase.functions.invoke('iara-pipeline', {
          body: { action: 'render', imageBase64: generatedImage || photo, description: `MODIFY ONLY INSIDE WHITE MASK. ${prompt || 'Materializar alteração pontual'}. 8K.` }
        });
        if (data?.render) {
          const url = data.render.startsWith('data:') ? data.render : `data:image/png;base64,${data.render}`;
          setGeneratedImage(url);
          setStep('result');
          const msg = { id: Date.now(), from: 'iara', text: 'Alteração pontual aplicada.', type: 'image', src: url, time: timeStr() };
          setMessages(prev => [...prev, msg]);
          const { data: { user } } = await supabase.auth.getUser();
          if (user) await supabase.from('renders').insert({ user_id: user.id, image_url: url, prompt: 'Mask edit' });
        }
      } catch (e) { setError(String(e.message)); }
      finally { setLoading(false); }
    })();
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `IARA_MASTER_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 150);
    } catch { setError("Erro ao exportar obra."); }
  };

  const openInspector = (src) => setInspectorData(src);

  // --- BOOT VIEW ---
  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[999]">
        <Logo />
        <div className="mt-12 space-y-4 flex flex-col items-center">
          <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ animation: 'loading 1.5s ease-in-out infinite' }} />
          </div>
          <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.5em]">{systemStatus}</p>
        </div>
        <style>{`@keyframes loading { 0% { width: 0%; left: 0%; } 50% { width: 100%; left: 0%; } 100% { width: 0%; left: 100%; } }`}</style>
      </div>
    );
  }

  // --- PLACEHOLDER TABS ---
  const PlaceholderTab = ({ title, icon: Icon }) => (
    <div className="h-full flex flex-col items-center justify-center px-8 text-center pb-20">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Icon size={28} className="text-white/20" />
      </div>
      <h2 className="text-lg font-black text-white/40 uppercase tracking-widest">{title}</h2>
      <p className="text-xs text-white/20 mt-2">Em breve</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#020617] text-white overflow-hidden font-['Inter',sans-serif]">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {/* ===== TAB: IARA (Studio + Chat) ===== */}
      {activeTab === 'iara' && (
        <div className="h-full flex flex-col">
          {/* HEADER */}
          {step !== 'result' && (
            <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-[env(safe-area-inset-top)] bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Logo size="small" />
                  <h1 className="text-sm font-black tracking-tight">IARA <span className="text-blue-500">STUDIO</span></h1>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowGallery(true)} className="p-2 text-white/40 hover:text-blue-400 transition-colors" title="Galeria">
                    <GalleryHorizontalEnd size={16} />
                  </button>
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">ONLINE</span>
                  </div>
                  {step === 'sketch' && (
                    <button onClick={resetAll} className="p-2 text-white/30 active:text-white transition-colors">
                      <RotateCcw size={16} />
                    </button>
                  )}
                  <button onClick={() => setShowSettings(true)} className="p-2 text-white/20 hover:text-white/60 transition-colors" title="Configurações">
                    <Settings size={14} />
                  </button>
                  <button onClick={() => supabase.auth.signOut()} className="p-2 text-white/20 hover:text-red-400 transition-colors" title="Sair">
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            </header>
          )}

          <main className="flex-1 overflow-hidden">
            {/* UPLOAD STEP */}
            {step === 'upload' && (
              <div className="h-full flex flex-col pb-20">
                {/* Chat Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto pt-24 pb-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center px-8 text-center">
                      <Logo />
                      <div className="mt-10 mb-8">
                        <h2 className="text-2xl font-black leading-tight tracking-tight">
                          MAPA DE<br/><span className="text-blue-500">PONTOS VIVOS.</span>
                        </h2>
                        <p className="text-white/30 text-xs mt-4 max-w-xs leading-relaxed">
                          Envie um rascunho ou foto do ambiente. A IARA irá materializar com precisão industrial.
                        </p>
                      </div>
                      <button onClick={triggerUpload} className="flex items-center justify-center gap-4 bg-blue-600 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/20 active:scale-95 transition-all border-b-4 border-blue-800">
                        <Camera size={20} /> Abrir Ambiente
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {messages.map((m) => (
                        <ChatBubble key={m.id} msg={m} onInspect={(src) => openInspector(src)} onMaskEdit={(src) => setMaskEditorData(src)} onMaterialChange={(src) => { setMaskEditorData(src); }} />
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start px-3 mb-2">
                          <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3 border border-white/5">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div className="px-4 pb-20 pt-2 border-t border-white/5 bg-[#020617]">
                  {generatedImage && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                      <button onClick={() => openInspector(generatedImage)} className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95">
                        <Pencil size={12} /> Editar Render
                      </button>
                      <button onClick={() => generateRender('multi')} className="shrink-0 px-4 py-2 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 border border-white/10">
                        <Eye size={12} /> Multi-Vista
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <button onClick={triggerUpload} className="p-2 text-white/40 active:scale-90">
                      <Camera size={20} />
                    </button>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 flex items-center">
                      <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendChat()}
                        placeholder="Pergunte à IARA..."
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                      />
                    </div>
                    <button onClick={sendChat} className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all">
                      {chatInput.trim() ? <Send size={16} /> : <Mic size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SKETCH STEP */}
            {step === 'sketch' && (
              <div className="h-full flex flex-col pb-20">
                <div className="flex-1 relative mt-20 mx-4 mb-4 rounded-3xl overflow-hidden border border-white/5 bg-white shadow-2xl" style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}>
                  <img src={photo} alt="Base" className="w-full h-full object-contain" />
                  {!showFullEnvironment && (
                    <canvas ref={canvasRef} width={1920} height={1080} className="absolute inset-0 w-full h-full touch-none"
                      onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                    />
                  )}
                  <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => setShowFullEnvironment(!showFullEnvironment)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${showFullEnvironment ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-black/60 border-white/10 text-white/60'}`}>
                      {showFullEnvironment ? <EyeOff size={12} /> : <Eye size={12} />} {showFullEnvironment ? "VOLTAR" : "VER AMBIENTE"}
                    </button>
                  </div>
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <button onClick={() => setZoomScale(prev => Math.min(prev + 0.5, 3))} className="w-10 h-10 bg-black/60 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-xl"><ZoomIn size={16}/></button>
                    <button onClick={() => setZoomScale(prev => Math.max(prev - 0.5, 1))} className="w-10 h-10 bg-black/60 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-xl"><ZoomOut size={16}/></button>
                  </div>
                  <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                    <button onClick={undo} className="w-10 h-10 bg-black/60 rounded-xl flex items-center justify-center text-white border border-white/10"><RotateCcw size={14}/></button>
                    <button onClick={() => setIsEraser(!isEraser)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/10 ${isEraser ? 'bg-red-600 shadow-lg' : 'bg-black/60 text-white'}`}>
                      {isEraser ? <Eraser size={14}/> : <PenTool size={14}/>}
                    </button>
                  </div>
                </div>
                <div className="px-6 pb-4 space-y-3">
                  <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="MDF, acabamento, puxador cava..." className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-xs font-medium text-white outline-none focus:border-blue-500 shadow-inner" />
                  <button onClick={() => generateRender('initial')} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl border-b-4 border-blue-800">
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <><Wand2 size={18}/> MATERIALIZAR OBRA</>}
                  </button>
                </div>
              </div>
            )}

            {/* RESULT STEP */}
            {step === 'result' && (
              <div className="h-full relative pb-20"
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
              >
                {isInspecting && (
                  <div className="fixed top-[env(safe-area-inset-top)] left-0 right-0 z-[120] flex items-center justify-between px-6 py-4 pointer-events-none">
                    <button onClick={cancelInspection} className="bg-slate-900/80 backdrop-blur-2xl text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl pointer-events-auto active:scale-90 border border-white/10 transition-all">
                      <ArrowRight size={14} className="rotate-180" /> VOLTAR
                    </button>
                    {pins.length > 0 && (
                      <button onClick={() => generateRender('refine')}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-blue-600/30 animate-pulse border-b-4 border-blue-800 active:scale-90 pointer-events-auto transition-all"
                      >
                        <Zap size={14} /> MATERIALIZAR ({pins.length})
                      </button>
                    )}
                  </div>
                )}

                <div className="w-full h-full flex items-center justify-center" style={{ transform: `translate(${panPosition.x}px, ${panPosition.y}px)`, transition: isDragging ? 'none' : 'transform 0.3s ease-out' }}>
                  <div className="relative max-w-full max-h-full" onClick={handleImageClick}>
                    <img src={generatedImage} alt="Render" className="max-w-full max-h-screen object-contain rounded-3xl shadow-2xl" draggable={false} />
                    {pins.map((pin) => (
                      <div key={pin.id} className="absolute z-[105]" style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -50%)' }}
                        onClick={(e) => { e.stopPropagation(); setActivePinId(pin.id); setIsRefining(true); }}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-xl animate-pulse" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45" />
                        {pin.prompt ? <Check size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" /> : <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[8px] font-black">?</span>}
                        {activePinId === pin.id && isRefining && (
                          <div className="absolute z-[200] w-[85vw] max-w-sm"
                            style={{ transform: `translate(${pin.x > 70 ? '-80%' : pin.x < 30 ? '0%' : '-40%'}, 0) scale(0.35)` }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.7)] space-y-4" style={{ transform: 'scale(2.85)', transformOrigin: 'top left' }}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><MapPin size={14} className="text-blue-400" /></div>
                                  <span className="text-xs font-black text-white/60 uppercase tracking-widest">Mini Bloco</span>
                                </div>
                                <button onClick={() => removePin(pin.id)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center active:bg-red-500 active:text-white transition-all"><Trash size={12}/></button>
                              </div>
                              <textarea value={pin.prompt} onChange={(e) => updatePinPrompt(pin.id, e.target.value)}
                                placeholder="Ex: 'Substituir porta por 4 gavetas'..."
                                className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-4 text-xl font-medium text-white outline-none focus:border-blue-500 h-28 resize-none shadow-inner"
                              />
                              <button onClick={savePin} className="w-full bg-blue-600 text-white py-4 rounded-[1.2rem] font-black text-lg uppercase tracking-widest active:scale-95 shadow-xl transition-all flex items-center justify-center gap-3">
                                <Save size={20}/> SALVAR PONTO
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {showResultUI && !isInspecting && (
                    <div className="absolute bottom-24 left-6 right-6 z-[110]" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                      <div className="bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-b-4 border-blue-900/50">
                        <div className="flex flex-col items-center gap-2 mb-6">
                          <div className="flex items-center gap-3 text-blue-400 bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20">
                            <Hand size={14} className="animate-bounce"/>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic leading-none">Toque para mergulhar no detalhe</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <button onClick={(e) => { e.stopPropagation(); downloadImage(); }} className="bg-white/5 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 active:scale-95 transition-all border border-white/10">
                            <Download size={18}/> Salvar
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); openInspector(generatedImage); }} className="bg-white/5 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 active:scale-95 transition-all border border-white/10">
                            <Eye size={18}/> Inspecionar
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); (async () => {
                            try {
                              const response = await fetch(generatedImage);
                              const blob = await response.blob();
                              const file = new File([blob], 'render.png', { type: 'image/png' });
                              if (navigator.canShare) await navigator.share({ files: [file], title: 'Projeto IARA' });
                            } catch {}
                          })(); }} className="bg-blue-600 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 active:scale-95 transition-all border-b-4 border-blue-800">
                            <Share2 size={18}/> Enviar
                          </button>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); resetAll(); setStep('upload'); }} className="w-full text-white/30 font-bold text-[8px] uppercase tracking-[0.4em] py-2 flex items-center justify-center gap-2 hover:text-blue-400 transition-colors italic">
                          NOVO AMBIENTE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ===== OTHER TABS ===== */}
      {activeTab === 'patio' && <PatioTab />}
      {activeTab === 'clientes' && <ClientesTab />}
      {activeTab === 'orcar' && <OrcarTab />}
      {activeTab === 'diario' && <DiarioTab />}

      {/* BOTTOM NAV */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <FeedbackNotification />

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-[500] bg-[#020617]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center">
          <Logo />
          <div className="mt-12 space-y-6">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={72} />
            <p className="text-white font-black text-[12px] uppercase tracking-[0.8em] animate-pulse italic leading-none">{loadingText}</p>
          </div>
        </div>
      )}

      {/* ERROR TOAST */}
      {error && (
        <div className="fixed top-12 left-4 right-4 z-[600] bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
          <div className="flex items-center gap-3">
            <ShieldAlert size={18} />
            <p className="text-[10px] font-bold uppercase tracking-widest italic">{String(error)}</p>
          </div>
          <button onClick={() => setError(null)}><X size={14}/></button>
        </div>
      )}

      {/* MODALS */}
      {showGallery && <Gallery onClose={() => setShowGallery(false)} />}
      {uploadPreviewData && <UploadPreview photo={uploadPreviewData} onCancel={() => setUploadPreviewData(null)} onConfirm={handleUploadPreviewConfirm} />}
      {inspectorData && <ImageInspector photo={inspectorData} onCancel={() => setInspectorData(null)} onSelectForEdit={handleInspectorEdit} onGenerateMultiView={handleInspectorMultiView} />}
      {maskEditorData && <MaskEditor photo={maskEditorData} onCancel={() => setMaskEditorData(null)} onConfirm={handleMaskConfirm} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loading { 0% { width: 0%; } 50% { width: 100%; } 100% { width: 0%; } }
      `}</style>
    </div>
  );
}
