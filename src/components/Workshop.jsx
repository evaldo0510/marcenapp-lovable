import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, Upload as UploadIcon, Download, Mic, MicOff, X, Loader2, 
  Pencil, Eraser, Trash2, Sparkle, 
  Check, Save, RotateCcw, Share2, Image as ImageIcon,
  Zap, ArrowRight, ShieldCheck, ZoomIn, ZoomOut, Maximize, Wand2,
  PenTool, Eye, EyeOff, Layers, MapPin, Send, ShieldAlert, PlusCircle, Trash, Hand
} from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

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
  // --- ESTADOS ---
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
    setLoading(true);
    setLoadingText("ESCANEANDO AMBIENTE...");
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target.result);
      setStep('sketch');
      setLoading(false);
    };
    reader.onerror = () => { setError("Erro ao ler ficheiro."); setLoading(false); };
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

  // --- MOTOR ALQUÍMICO (via Edge Function) ---
  const generateRender = async (mode = 'initial') => {
    setLoading(true);
    setLoadingText(mode === 'refine' ? "UNINDO INTENÇÕES..." : "MATERIALIZANDO PROJETO...");
    setError(null);
    
    try {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = 1920; finalCanvas.height = 1080; 
      const fCtx = finalCanvas.getContext('2d');
      const photoImg = new Image();
      photoImg.crossOrigin = "anonymous";
      photoImg.src = mode === 'refine' ? generatedImage : photo;
      
      await new Promise((resolve, reject) => {
        photoImg.onload = resolve;
        photoImg.onerror = () => reject(new Error("Erro ao carregar imagem base."));
      });
      
      const scale = Math.min(1920 / photoImg.width, 1080 / photoImg.height);
      const x = (1920 - photoImg.width * scale) / 2;
      const y = (1080 - photoImg.height * scale) / 2;
      fCtx.fillStyle = "black"; fCtx.fillRect(0,0,1920,1080);
      fCtx.drawImage(photoImg, x, y, photoImg.width * scale, photoImg.height * scale);
      
      if (mode === 'initial' && canvasRef.current) {
        fCtx.drawImage(canvasRef.current, 0, 0, 1920, 1080);
      }
      
      const inputDataUrl = finalCanvas.toDataURL('image/png');

      const multiPrompt = pins
        .filter(p => p.prompt.trim() !== "")
        .map(p => `[Alteration at x:${p.x.toFixed(1)}%, y:${p.y.toFixed(1)}%]: ${p.prompt}`)
        .join("; ");

      const description = mode === 'refine' 
        ? `TECHNICAL RECONFIGURATION. ORDERS: "${multiPrompt}". QUALITY: Photorealistic 8K.`
        : `100% FAITHFUL SKETCH MATERIALIZATION. ${prompt || 'MDF premium finish'}. 8K Realistic.`;

      const { data, error: fnError } = await supabase.functions.invoke('iara-pipeline', {
        body: { action: 'render', imageBase64: inputDataUrl, description }
      });

      if (fnError) throw fnError;
      
      if (data?.render) {
        setGeneratedImage(data.render.startsWith('data:') ? data.render : `data:image/png;base64,${data.render}`);
        setStep('result');
        setIsInspecting(false);
        setPins([]);
        setActivePinId(null);
        setIsRefining(false);
        setPanPosition({ x: 0, y: 0 });
        setShowResultUI(true);
      } else {
        throw new Error(data?.error || "Não foi possível materializar as alterações.");
      }
    } catch (e) { 
      setError(String(e.message || "Erro desconhecido.")); 
    } finally { 
      setLoading(false); 
    }
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

  return (
    <div className="fixed inset-0 bg-[#020617] text-white overflow-hidden font-['Inter',sans-serif]">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      
      {/* HEADER */}
      {step !== 'result' && (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-[env(safe-area-inset-top)] bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Logo size="small" />
              <h1 className="text-sm font-black tracking-tight">IARA <span className="text-blue-500">STUDIO</span></h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">ESTADO SÓLIDO</span>
              </div>
              {step === 'sketch' && (
                <button onClick={resetAll} className="p-2 text-white/30 active:text-white transition-colors">
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* MAIN CONTENT */}
      <main className="h-full">
        
        {/* UPLOAD STEP */}
        {step === 'upload' && (
          <div className="h-full flex flex-col items-center justify-center px-8 text-center">
            <Logo />
            <div className="mt-10 mb-12">
              <h2 className="text-3xl font-black leading-tight tracking-tight">
                MAPA DE<br/><span className="text-blue-500">PONTOS VIVOS.</span>
              </h2>
              <p className="text-white/30 text-xs mt-4 max-w-xs leading-relaxed">
                Fixe múltiplos pontos de alteração e salve as suas intenções.
              </p>
            </div>
            <div className="space-y-4 w-full max-w-xs">
              <button onClick={triggerUpload} className="w-full flex items-center justify-center gap-4 bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/20 active:scale-95 transition-all border-b-4 border-blue-800">
                <Camera size={20} />
                Abrir Ambiente
              </button>
            </div>
          </div>
        )}

        {/* SKETCH STEP */}
        {step === 'sketch' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 relative mt-20 mx-4 mb-4 rounded-3xl overflow-hidden border border-white/5 bg-white shadow-2xl" style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}>
              <img src={photo} alt="Base" className="w-full h-full object-contain" />
              {!showFullEnvironment && (
                <canvas
                  ref={canvasRef}
                  width={1920} height={1080}
                  className="absolute inset-0 w-full h-full touch-none"
                  onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                />
              )}

              {/* Toggle Ambiente */}
              <div className="absolute top-4 left-4 z-10">
                <button onClick={() => setShowFullEnvironment(!showFullEnvironment)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${showFullEnvironment ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-black/60 border-white/10 text-white/60'}`}>
                  {showFullEnvironment ? <EyeOff size={12} /> : <Eye size={12} />} {showFullEnvironment ? "VOLTAR" : "VER AMBIENTE"}
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button onClick={() => setZoomScale(prev => Math.min(prev + 0.5, 3))} className="w-10 h-10 bg-black/60 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-xl"><ZoomIn size={16}/></button>
                <button onClick={() => setZoomScale(prev => Math.max(prev - 0.5, 1))} className="w-10 h-10 bg-black/60 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-xl"><ZoomOut size={16}/></button>
              </div>

              {/* Drawing Tools */}
              <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                <button onClick={undo} className="w-10 h-10 bg-black/60 rounded-xl flex items-center justify-center text-white border border-white/10"><RotateCcw size={14}/></button>
                <button onClick={() => setIsEraser(!isEraser)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/10 ${isEraser ? 'bg-red-600 shadow-lg' : 'bg-black/60 text-white'}`}>
                  {isEraser ? <Eraser size={14}/> : <PenTool size={14}/>}
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <div className="px-6 pb-8 space-y-3">
              <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="MDF, acabamento, puxador cava..." className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-xs font-medium text-white outline-none focus:border-blue-500 shadow-inner" />
              <button onClick={() => generateRender('initial')} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl border-b-4 border-blue-800">
                {loading ? <Loader2 className="animate-spin" size={18}/> : <><Wand2 size={18}/> MATERIALIZAR OBRA</>}
              </button>
            </div>
          </div>
        )}

        {/* RESULT STEP */}
        {step === 'result' && (
          <div className="h-full relative"
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
          >
            {/* Inspection Controls */}
            {isInspecting && (
              <div className="fixed top-[env(safe-area-inset-top)] left-0 right-0 z-[120] flex items-center justify-between px-6 py-4 pointer-events-none">
                <button onClick={cancelInspection} className="bg-slate-900/80 backdrop-blur-2xl text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl pointer-events-auto active:scale-90 border border-white/10 transition-all">
                  <ArrowRight size={14} className="rotate-180" /> VOLTAR AO PANORAMA
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
                
                {/* Pins */}
                {pins.map((pin) => (
                  <div key={pin.id} className="absolute z-[105]" style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -50%)' }}
                    onClick={(e) => { e.stopPropagation(); setActivePinId(pin.id); setIsRefining(true); }}
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-xl animate-pulse" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45" />
                    {pin.prompt ? <Check size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" /> : <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[8px] font-black">?</span>}

                    {/* Pin Editor */}
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
                            <div className="flex gap-2">
                              <button onClick={() => removePin(pin.id)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center active:bg-red-500 active:text-white transition-all"><Trash size={12}/></button>
                            </div>
                          </div>

                          <textarea value={pin.prompt} onChange={(e) => updatePinPrompt(pin.id, e.target.value)} 
                            placeholder="Ensine a IARA (Ex: 'Substituir porta por 4 gavetas')..."
                            className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-4 text-xl font-medium text-white outline-none focus:border-blue-500 h-28 resize-none shadow-inner"
                          />

                          <button onClick={savePin}
                            className="w-full bg-blue-600 text-white py-4 rounded-[1.2rem] font-black text-lg uppercase tracking-widest active:scale-95 shadow-xl transition-all flex items-center justify-center gap-3"
                          >
                            <Save size={20}/> SALVAR PONTO
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Controls */}
              {showResultUI && !isInspecting && (
                <div className="absolute bottom-10 left-6 right-6 z-[110]" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                  <div className="bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-b-4 border-blue-900/50">
                    <div className="flex flex-col items-center gap-2 mb-6">
                      <div className="flex items-center gap-3 text-blue-400 bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20">
                        <Hand size={14} className="animate-bounce"/>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] italic leading-none">Toque para mergulhar no detalhe</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <button onClick={(e) => { e.stopPropagation(); downloadImage(); }} className="bg-white/5 text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg border border-white/10 group">
                        <Download size={20} className="group-hover:translate-y-0.5 transition-transform"/><span>SALVAR 8K</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); (async () => {
                        try {
                          const response = await fetch(generatedImage);
                          const blob = await response.blob();
                          const file = new File([blob], 'render.png', { type: 'image/png' });
                          if (navigator.canShare) await navigator.share({ files: [file], title: 'Projeto IARA' });
                        } catch {}
                      })(); }} className="bg-blue-600 text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl border-b-4 border-blue-800">
                        <Share2 size={20}/><span>ENVIAR</span>
                      </button>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); resetAll(); }} className="w-full text-white/30 font-bold text-[8px] uppercase tracking-[0.4em] py-2 flex items-center justify-center gap-2 hover:text-blue-400 transition-colors italic tracking-widest">
                      MÓDULO DE NOVO AMBIENTE
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

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

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loading { 0% { width: 0%; } 50% { width: 100%; } 100% { width: 0%; } }
      `}</style>
    </div>
  );
}
