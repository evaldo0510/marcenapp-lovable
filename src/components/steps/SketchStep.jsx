import React, { memo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, PenTool, Eraser, Wand2, Loader2 } from 'lucide-react';

function SketchStep({
  photo, canvasRef, zoomScale, setZoomScale, showFullEnvironment, setShowFullEnvironment,
  isEraser, setIsEraser, undo, startDrawing, draw, stopDrawing,
  prompt, setPrompt, loading, generateRender
}) {
  return (
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
          <button onClick={() => setZoomScale(prev => Math.min(prev + 0.5, 3))} className="w-10 h-10 bg-black/60 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-xl"><ZoomIn size={16} /></button>
          <button onClick={() => setZoomScale(prev => Math.max(prev - 0.5, 1))} className="w-10 h-10 bg-black/60 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-xl"><ZoomOut size={16} /></button>
        </div>
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
          <button onClick={undo} className="w-10 h-10 bg-black/60 rounded-xl flex items-center justify-center text-white border border-white/10"><RotateCcw size={14} /></button>
          <button onClick={() => setIsEraser(!isEraser)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/10 ${isEraser ? 'bg-red-600 shadow-lg' : 'bg-black/60 text-white'}`}>
            {isEraser ? <Eraser size={14} /> : <PenTool size={14} />}
          </button>
        </div>
      </div>
      <div className="px-6 pb-4 space-y-3">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="MDF, acabamento, puxador cava..." className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-xs font-medium text-white outline-none focus:border-blue-500 shadow-inner" />
        <button onClick={() => generateRender('initial')} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl border-b-4 border-blue-800">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <><Wand2 size={18} /> MATERIALIZAR OBRA</>}
        </button>
      </div>
    </div>
  );
}

export default memo(SketchStep);
