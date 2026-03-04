import React, { useRef, useState, useEffect } from 'react';
import { X, Target, Trash2, Zap } from 'lucide-react';

export default function MaskEditor({ photo, onCancel, onConfirm }) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const SIZE = 1024;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    points.forEach(p => {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 100);
      grad.addColorStop(0, 'rgba(59, 130, 246, 1)');
      grad.addColorStop(0.4, 'rgba(59, 130, 246, 0.4)');
      grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points]);

  const handlePoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    setPoints(prev => [...prev, { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY, id: Date.now() }]);
  };

  const handleConfirm = () => {
    const c = document.createElement('canvas');
    c.width = SIZE; c.height = SIZE;
    const ctx = c.getContext('2d');
    points.forEach(p => {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 90, 0, Math.PI * 2);
      ctx.fill();
    });
    onConfirm(c.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-[400] bg-[#020617] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button onClick={onCancel} className="text-white/60 text-xs font-bold flex items-center gap-2">
          <X size={16} /> Sair
        </button>
        <div className="flex items-center gap-2 text-blue-400">
          <Target size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Âncora de Alteração</span>
        </div>
        <div className="flex gap-2">
          {points.length > 0 && (
            <button onClick={() => setPoints([])} className="p-2 text-red-400 active:scale-90">
              <Trash2 size={16} />
            </button>
          )}
          <button 
            onClick={handleConfirm} 
            disabled={points.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 disabled:opacity-30"
          >
            <Zap size={12} /> Aplicar ({points.length})
          </button>
        </div>
      </header>

      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden">
        <img src={photo} alt="Base" className="absolute inset-0 w-full h-full object-contain" />
        <canvas
          ref={canvasRef}
          width={SIZE} height={SIZE}
          className="absolute inset-0 w-full h-full object-contain touch-none opacity-60"
          onClick={handlePoint}
          onTouchEnd={handlePoint}
        />
        {/* Point indicators */}
        {points.map(p => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return null;
          const x = (p.x / SIZE) * rect.width + rect.left;
          const y = (p.y / SIZE) * rect.height + rect.top;
          return (
            <div key={p.id} className="absolute pointer-events-none" style={{ left: `${(p.x / SIZE) * 100}%`, top: `${(p.y / SIZE) * 100}%`, transform: 'translate(-50%,-50%)' }}>
              <div className="w-4 h-4 rounded-full border-2 border-white bg-blue-500/50 animate-pulse" />
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="px-6 py-4 border-t border-white/5 text-center">
        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Toque para marcar pontos de alteração</p>
        <p className="text-[9px] text-white/30 mt-1">A estrutura original será preservada com rigor.</p>
      </div>
    </div>
  );
}
