import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Loader2, RotateCcw, Settings, LogOut, GalleryHorizontalEnd, ShieldAlert, X, MoreVertical
} from 'lucide-react';
import useVoiceControl from '../hooks/useVoiceControl';
import { supabase } from '../integrations/supabase/client';
import BottomNav from './BottomNav';
import FeedbackNotification from './FeedbackNotification';
import UploadStep from './steps/UploadStep';
import SketchStep from './steps/SketchStep';
import ResultStep from './steps/ResultStep';

// Lazy-loaded components
const Gallery = lazy(() => import('./Gallery'));
const SettingsPanel = lazy(() => import('./SettingsPanel'));
const UploadPreview = lazy(() => import('./UploadPreview'));
const ImageInspector = lazy(() => import('./ImageInspector'));
const MaskEditor = lazy(() => import('./MaskEditor'));
const PatioTab = lazy(() => import('./tabs/PatioTab'));
const ClientesTab = lazy(() => import('./tabs/ClientesTab'));
const OrcarTab = lazy(() => import('./tabs/OrcarTab'));
const DiarioTab = lazy(() => import('./tabs/DiarioTab'));

import HexLogo from './HexLogo';

const LazyFallback = () => (
  <div className="flex items-center justify-center h-40">
    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function Workshop() {
  const [activeTab, setActiveTab] = useState('iara');
  const [isBooting, setIsBooting] = useState(true);
  const [systemStatus, setSystemStatus] = useState("DESPERTANDO IARA...");

  const [step, setStep] = useState('upload');
  const [photo, setPhoto] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("TECENDO REALIDADE...");
  const [error, setError] = useState(null);
  const [showResultUI, setShowResultUI] = useState(true);
  const [showFullEnvironment, setShowFullEnvironment] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const [pins, setPins] = useState([]);
  const [activePinId, setActivePinId] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isEraser, setIsEraser] = useState(false);
  const [brushSize] = useState(6);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [zoomScale, setZoomScale] = useState(1);
  const [prompt, setPrompt] = useState("");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [uploadPreviewData, setUploadPreviewData] = useState(null);
  const [maskEditorData, setMaskEditorData] = useState(null);
  const [inspectorData, setInspectorData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef(null);
  const voice = useVoiceControl();

  // Boot
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

  useEffect(() => {
    if (voice.transcript) setChatInput(voice.transcript);
  }, [voice.transcript]);

  const timeStr = useCallback(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), []);

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

  const handleUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setUploadPreviewData(event.target.result);
    reader.onerror = () => setError("Erro ao ler ficheiro.");
    reader.readAsDataURL(file);
  }, []);

  const triggerUpload = useCallback(() => fileInputRef.current?.click(), []);

  // Drawing handlers
  const startDrawing = useCallback((e) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }, [getCoords]);

  const draw = useCallback((e) => {
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
  }, [isDrawing, isEraser, brushSize, getCoords]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) setCanvasHistory(prev => [...prev, canvasRef.current.toDataURL()]);
  }, [isDrawing]);

  // Pan/Zoom
  const handleMouseDown = useCallback((e) => {
    if (!isInspecting || isRefining) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - panPosition.x, y: clientY - panPosition.y });
  }, [isInspecting, isRefining, panPosition]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPanPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleImageClick = useCallback((e) => {
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
      setPins(prev => [...prev, newPin]);
      setActivePinId(newPin.id);
      setIsRefining(true);
    }
  }, [step, isDragging, activePinId, isInspecting]);

  const updatePinPrompt = useCallback((id, text) => setPins(prev => prev.map(p => p.id === id ? { ...p, prompt: text } : p)), []);
  const removePin = useCallback((id) => { setPins(prev => prev.filter(p => p.id !== id)); setActivePinId(null); setIsRefining(false); }, []);
  const savePin = useCallback(() => { setActivePinId(null); setIsRefining(false); }, []);
  const cancelInspection = useCallback(() => {
    setIsInspecting(false); setIsRefining(false); setActivePinId(null);
    setPins([]); setPanPosition({ x: 0, y: 0 }); setShowResultUI(true);
  }, []);

  // Render engine
  const generateRender = useCallback(async (mode = 'initial') => {
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
          const iaraMsg = { id: Date.now(), from: 'iara', text: "Materialização concluída. Toque para inspecionar.", type: 'image', src: imageUrl, time: timeStr() };
          setMessages(prev => [...prev, iaraMsg]);
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
  }, [generatedImage, photo, pins, prompt, timeStr]);

  // Chat
  const sendChat = useCallback(async () => {
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
      const replyText = data?.text || 'Erro operacional.';
      const iaraMsg = { id: Date.now() + 1, from: 'iara', text: replyText, type: 'text', time: timeStr() };
      setMessages(prev => [...prev, iaraMsg]);
      if (voice.ttsSupported) voice.speak(replyText);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'iara', text: 'Erro no processamento.', type: 'text', time: timeStr() }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, generatedImage, timeStr, voice]);

  // Modal handlers
  const handleUploadPreviewConfirm = useCallback((caption) => {
    setPhoto(uploadPreviewData);
    setPrompt(caption);
    setUploadPreviewData(null);
    setStep('sketch');
  }, [uploadPreviewData]);

  // Direct render from photo (no sketch)
  const handleDirectRender = useCallback(async (caption) => {
    const imageData = uploadPreviewData;
    setUploadPreviewData(null);
    setPhoto(imageData);
    setPrompt(caption);
    setLoading(true);
    setLoadingText("IARA ANALISANDO AMBIENTE...");
    setError(null);
    try {
      // Step 1: Analyze the environment
      const { data: analysis, error: analysisErr } = await supabase.functions.invoke('iara-pipeline', {
        body: { action: 'analyze', imageBase64: imageData, prompt: caption || 'Analise este ambiente e sugira móveis planejados ideais para o espaço.' }
      });
      if (analysisErr) throw analysisErr;

      const desc = analysis?.description || 'Móvel planejado premium';
      const analysisMsg = {
        id: Date.now(), from: 'iara', type: 'text', time: timeStr(),
        text: `📐 **Análise do ambiente:**\n${desc}\n\n${analysis?.project ? `Tipo: ${analysis.project.tipo}\nMateriais: ${analysis.project.materiais?.estrutura || 'MDF 18mm'}\nValor estimado: R$ ${analysis.project.valor_mercado?.toLocaleString('pt-BR') || '—'}` : ''}\n\nGerando render...`
      };
      setMessages(prev => [...prev, analysisMsg]);

      // Step 2: Generate render
      setLoadingText("MATERIALIZANDO PROJETO...");
      const renderPrompt = `ENVIRONMENT-BASED FURNITURE PROJECT. Analyze the room geometry, walls, floor, lighting. Design and insert ideal custom furniture (${caption || desc}). Materials: PBR Wood grain CARVALHO MALVA and MATTE WHITE. 8K Photorealistic ArchViz.`;
      const { data: renderData, error: renderErr } = await supabase.functions.invoke('iara-pipeline', {
        body: { action: 'render', imageBase64: imageData, description: renderPrompt }
      });
      if (renderErr) throw renderErr;

      if (renderData?.render) {
        const imageUrl = renderData.render.startsWith('data:') ? renderData.render : `data:image/png;base64,${renderData.render}`;
        setGeneratedImage(imageUrl);
        setStep('result');
        setShowResultUI(true);
        const renderMsg = { id: Date.now() + 1, from: 'iara', text: 'Projeto gerado a partir da foto do ambiente.', type: 'image', src: imageUrl, time: timeStr() };
        setMessages(prev => [...prev, renderMsg]);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('renders').insert({ user_id: user.id, image_url: imageUrl, prompt: renderPrompt });
      } else {
        throw new Error(renderData?.error || "Falha na materialização.");
      }
    } catch (e) {
      setError(String(e.message || "Erro ao gerar projeto direto."));
    } finally {
      setLoading(false);
    }
  }, [uploadPreviewData, timeStr]);

  const handleInspectorEdit = useCallback((imgSrc) => {
    setInspectorData(null);
    setMaskEditorData(imgSrc);
  }, []);

  const handleInspectorMultiView = useCallback(() => {
    setInspectorData(null);
    generateRender('multi');
  }, [generateRender]);

  const handleMaskConfirm = useCallback((maskBase64) => {
    setMaskEditorData(null);
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
  }, [generatedImage, photo, prompt, timeStr]);

  const downloadImage = useCallback(async () => {
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
  }, [generatedImage]);

  const openInspector = useCallback((src) => setInspectorData(src), []);

  // Boot screen
  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[999]">
        <HexLogo size={72} active />
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

  return (
    <div className="fixed inset-0 bg-[#020617] text-white overflow-hidden font-['Inter',sans-serif]">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {activeTab === 'iara' && (
        <div className="h-full flex flex-col">
          {step !== 'result' && (
            <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-[env(safe-area-inset-top)] bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <HexLogo size={32} active />
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
            {step === 'upload' && (
              <UploadStep
                messages={messages} chatLoading={chatLoading} scrollRef={scrollRef}
                chatInput={chatInput} setChatInput={setChatInput} sendChat={sendChat}
                triggerUpload={triggerUpload} voice={voice} generatedImage={generatedImage}
                openInspector={openInspector} generateRender={generateRender}
                setMaskEditorData={setMaskEditorData}
              />
            )}

            {step === 'sketch' && (
              <SketchStep
                photo={photo} canvasRef={canvasRef} zoomScale={zoomScale} setZoomScale={setZoomScale}
                showFullEnvironment={showFullEnvironment} setShowFullEnvironment={setShowFullEnvironment}
                isEraser={isEraser} setIsEraser={setIsEraser} undo={undo}
                startDrawing={startDrawing} draw={draw} stopDrawing={stopDrawing}
                prompt={prompt} setPrompt={setPrompt} loading={loading} generateRender={generateRender}
              />
            )}

            {step === 'result' && (
              <ResultStep
                generatedImage={generatedImage} pins={pins} activePinId={activePinId}
                isInspecting={isInspecting} isRefining={isRefining} isDragging={isDragging}
                panPosition={panPosition} showResultUI={showResultUI}
                handleMouseDown={handleMouseDown} handleMouseMove={handleMouseMove}
                handleMouseUp={handleMouseUp} handleImageClick={handleImageClick}
                cancelInspection={cancelInspection} generateRender={generateRender}
                updatePinPrompt={updatePinPrompt} removePin={removePin} savePin={savePin}
                downloadImage={downloadImage} openInspector={openInspector}
                resetAll={resetAll} setStep={setStep}
              />
            )}
          </main>
        </div>
      )}

      {/* Lazy-loaded tabs */}
      <Suspense fallback={<LazyFallback />}>
        {activeTab === 'patio' && <PatioTab />}
        {activeTab === 'clientes' && <ClientesTab />}
        {activeTab === 'orcar' && <OrcarTab />}
        {activeTab === 'diario' && <DiarioTab />}
      </Suspense>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <FeedbackNotification />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[500] bg-[#020617]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center">
          <HexLogo size={72} active />
          <div className="mt-12 space-y-6">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={72} />
            <p className="text-white font-black text-[12px] uppercase tracking-[0.8em] animate-pulse italic leading-none">{loadingText}</p>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed top-12 left-4 right-4 z-[600] bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
          <div className="flex items-center gap-3">
            <ShieldAlert size={18} />
            <p className="text-[10px] font-bold uppercase tracking-widest italic">{String(error)}</p>
          </div>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Lazy modals */}
      <Suspense fallback={null}>
        {showGallery && <Gallery onClose={() => setShowGallery(false)} />}
        {uploadPreviewData && <UploadPreview photo={uploadPreviewData} onCancel={() => setUploadPreviewData(null)} onConfirm={handleUploadPreviewConfirm} onDirectRender={handleDirectRender} />}
        {inspectorData && <ImageInspector photo={inspectorData} onCancel={() => setInspectorData(null)} onSelectForEdit={handleInspectorEdit} onGenerateMultiView={handleInspectorMultiView} />}
        {maskEditorData && <MaskEditor photo={maskEditorData} onCancel={() => setMaskEditorData(null)} onConfirm={handleMaskConfirm} />}
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </Suspense>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loading { 0% { width: 0%; } 50% { width: 100%; } 100% { width: 0%; } }
      `}</style>
    </div>
  );
}
