import React, { memo } from 'react';
import {
  ArrowRight, Zap, Check, MapPin, Trash, Save, Download, Eye, Share2, Hand, X
} from 'lucide-react';

function ResultStep({
  generatedImage, pins, activePinId, isInspecting, isRefining, isDragging,
  panPosition, showResultUI,
  handleMouseDown, handleMouseMove, handleMouseUp, handleImageClick,
  cancelInspection, generateRender, updatePinPrompt, removePin, savePin,
  downloadImage, openInspector, resetAll, setStep
}) {
  return (
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
              onClick={(e) => { e.stopPropagation(); }}
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
                      <button onClick={() => removePin(pin.id)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center active:bg-red-500 active:text-white transition-all"><Trash size={12} /></button>
                    </div>
                    <textarea value={pin.prompt} onChange={(e) => updatePinPrompt(pin.id, e.target.value)}
                      placeholder="Ex: 'Substituir porta por 4 gavetas'..."
                      className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-5 py-4 text-xl font-medium text-white outline-none focus:border-blue-500 h-28 resize-none shadow-inner"
                    />
                    <button onClick={savePin} className="w-full bg-blue-600 text-white py-4 rounded-[1.2rem] font-black text-lg uppercase tracking-widest active:scale-95 shadow-xl transition-all flex items-center justify-center gap-3">
                      <Save size={20} /> SALVAR PONTO
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
                  <Hand size={14} className="animate-bounce" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic leading-none">Toque para mergulhar no detalhe</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button onClick={(e) => { e.stopPropagation(); downloadImage(); }} className="bg-white/5 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 active:scale-95 transition-all border border-white/10">
                  <Download size={18} /> Salvar
                </button>
                <button onClick={(e) => { e.stopPropagation(); openInspector(generatedImage); }} className="bg-white/5 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 active:scale-95 transition-all border border-white/10">
                  <Eye size={18} /> Inspecionar
                </button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  (async () => {
                    try {
                      const response = await fetch(generatedImage);
                      const blob = await response.blob();
                      const file = new File([blob], 'render.png', { type: 'image/png' });
                      if (navigator.canShare) await navigator.share({ files: [file], title: 'Projeto IARA' });
                    } catch { }
                  })();
                }} className="bg-blue-600 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex flex-col items-center gap-2 active:scale-95 transition-all border-b-4 border-blue-800">
                  <Share2 size={18} /> Enviar
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
  );
}

export default memo(ResultStep);
