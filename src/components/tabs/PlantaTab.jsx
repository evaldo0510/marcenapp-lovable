import React, { useState, useRef, useEffect } from 'react';
import { Layers, ChevronUp, ChevronDown, ZoomIn, ZoomOut, RotateCcw, Move, Ruler } from 'lucide-react';

const FLOORS = [
  { id: 3, label: 'Cobertura', height: '+8.55m', color: '#007AFF', modules: ['Terraço', 'Caixa d\'água'] },
  { id: 2, label: '2º Pavimento', height: '+5.70m', color: '#00A884', modules: ['Quarto 1', 'Quarto 2', 'Banheiro', 'Corredor'] },
  { id: 1, label: '1º Pavimento', height: '+2.85m', color: '#FF9500', modules: ['Sala', 'Cozinha', 'Lavabo', 'Varanda'] },
  { id: 0, label: 'Térreo', height: '±0.00m', color: '#FF3B30', modules: ['Garagem', 'Hall', 'Área Técnica'] },
];

export default function PlantaTab({ generatedImage }) {
  const [activeFloor, setActiveFloor] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);

  const floor = FLOORS.find(f => f.id === activeFloor);

  // Draw 3D isometric building
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const baseY = h * 0.75;
    const floorH = 60;
    const floorW = 180;
    const floorD = 90;
    const isoAngle = Math.PI / 6;

    // Draw each floor as isometric box
    FLOORS.slice().reverse().forEach((f, i) => {
      const y = baseY - i * floorH;
      const isActive = f.id === activeFloor;
      const alpha = isActive ? 1 : 0.3;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Top face
      ctx.beginPath();
      ctx.moveTo(cx, y - floorH);
      ctx.lineTo(cx + floorW * Math.cos(isoAngle), y - floorH + floorW * Math.sin(isoAngle) * 0.5);
      ctx.lineTo(cx, y - floorH + floorW * Math.sin(isoAngle));
      ctx.lineTo(cx - floorW * Math.cos(isoAngle), y - floorH + floorW * Math.sin(isoAngle) * 0.5);
      ctx.closePath();
      ctx.fillStyle = isActive ? f.color + '40' : '#ffffff10';
      ctx.strokeStyle = isActive ? f.color : '#ffffff30';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.fill();
      ctx.stroke();

      // Right face
      ctx.beginPath();
      ctx.moveTo(cx + floorW * Math.cos(isoAngle), y - floorH + floorW * Math.sin(isoAngle) * 0.5);
      ctx.lineTo(cx, y - floorH + floorW * Math.sin(isoAngle));
      ctx.lineTo(cx, y + floorW * Math.sin(isoAngle) - floorH + floorH);
      ctx.lineTo(cx + floorW * Math.cos(isoAngle), y + floorW * Math.sin(isoAngle) * 0.5);
      ctx.closePath();
      ctx.fillStyle = isActive ? f.color + '25' : '#ffffff08';
      ctx.strokeStyle = isActive ? f.color + '80' : '#ffffff20';
      ctx.fill();
      ctx.stroke();

      // Left face
      ctx.beginPath();
      ctx.moveTo(cx - floorW * Math.cos(isoAngle), y - floorH + floorW * Math.sin(isoAngle) * 0.5);
      ctx.lineTo(cx, y - floorH + floorW * Math.sin(isoAngle));
      ctx.lineTo(cx, y + floorW * Math.sin(isoAngle) - floorH + floorH);
      ctx.lineTo(cx - floorW * Math.cos(isoAngle), y + floorW * Math.sin(isoAngle) * 0.5);
      ctx.closePath();
      ctx.fillStyle = isActive ? f.color + '18' : '#ffffff05';
      ctx.strokeStyle = isActive ? f.color + '60' : '#ffffff15';
      ctx.fill();
      ctx.stroke();

      // Label
      if (isActive) {
        ctx.globalAlpha = 1;
        ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.fillStyle = f.color;
        ctx.textAlign = 'center';
        ctx.fillText(f.label, cx, y - floorH + floorW * Math.sin(isoAngle) * 0.5 + 5);

        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = '#ffffff80';
        ctx.fillText(f.height, cx, y - floorH + floorW * Math.sin(isoAngle) * 0.5 + 20);
      }

      ctx.restore();
    });

    // Height indicator line
    ctx.strokeStyle = '#007AFF40';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx + floorW * Math.cos(isoAngle) + 30, baseY + floorH);
    ctx.lineTo(cx + floorW * Math.cos(isoAngle) + 30, baseY - FLOORS.length * floorH);
    ctx.stroke();
    ctx.setLineDash([]);

  }, [activeFloor, zoom, rotation]);

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight font-['Orbitron',sans-serif]">Elevador</h1>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Planta de Níveis</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-2 bg-white/5 rounded-xl text-white/40 active:scale-90 border border-white/5">
              <ZoomIn size={16} />
            </button>
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 bg-white/5 rounded-xl text-white/40 active:scale-90 border border-white/5">
              <ZoomOut size={16} />
            </button>
            <button onClick={() => setRotation(r => r + 45)} className="p-2 bg-white/5 rounded-xl text-white/40 active:scale-90 border border-white/5">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 relative mx-4 mb-4 bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
        {generatedImage ? (
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}>
            <img src={generatedImage} alt="Planta" className="max-w-full max-h-full object-contain opacity-20" />
          </div>
        ) : null}

        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          className="w-full h-full"
          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }}
        />

        {/* Level indicator */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10">
          <p className="text-[8px] text-white/40 font-black uppercase tracking-widest mb-1">Nível Activo</p>
          <p className="text-lg font-black font-['Orbitron',sans-serif]" style={{ color: floor?.color }}>{floor?.height}</p>
          <p className="text-[10px] text-white/60 font-bold">{floor?.label}</p>
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-xl rounded-full px-3 py-1.5 border border-white/10">
          <p className="text-[9px] text-white/40 font-bold">{Math.round(zoom * 100)}%</p>
        </div>
      </div>

      {/* Floor Selector */}
      <div className="px-4 mb-2">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Pavimentos</p>
          <div className="flex gap-1">
            <button onClick={() => setActiveFloor(f => Math.min(f + 1, 3))} className="p-1.5 bg-white/5 rounded-lg text-white/30 active:scale-90 border border-white/5">
              <ChevronUp size={12} />
            </button>
            <button onClick={() => setActiveFloor(f => Math.max(f - 1, 0))} className="p-1.5 bg-white/5 rounded-lg text-white/30 active:scale-90 border border-white/5">
              <ChevronDown size={12} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {FLOORS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFloor(f.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98] ${
                activeFloor === f.id
                  ? 'bg-white/[0.06] border-white/10 shadow-lg'
                  : 'bg-transparent border-transparent'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-['Orbitron',sans-serif]"
                style={{
                  backgroundColor: activeFloor === f.id ? f.color + '20' : 'transparent',
                  color: activeFloor === f.id ? f.color : '#ffffff30',
                  border: `1px solid ${activeFloor === f.id ? f.color + '40' : 'transparent'}`,
                }}
              >
                {f.id}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-xs font-black ${activeFloor === f.id ? 'text-white' : 'text-white/30'}`}>{f.label}</p>
                <p className="text-[9px] text-white/20">{f.modules.join(' • ')}</p>
              </div>
              <div className="text-right">
                <p className={`text-[10px] font-bold font-['Orbitron',sans-serif] ${activeFloor === f.id ? 'text-white/60' : 'text-white/15'}`}>{f.height}</p>
                <p className="text-[8px] text-white/15">{f.modules.length} amb.</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
