import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layers, ChevronUp, ChevronDown, ZoomIn, ZoomOut, RotateCcw, Plus, X, Image, Trash2 } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

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
  const [floorRenders, setFloorRenders] = useState({});
  const [showRenderPicker, setShowRenderPicker] = useState(false);
  const [availableRenders, setAvailableRenders] = useState([]);
  const [selectedRender, setSelectedRender] = useState(null);
  const canvasRef = useRef(null);

  const floor = FLOORS.find(f => f.id === activeFloor);
  const activeFloorRenders = floorRenders[activeFloor] || [];

  // Load floor renders
  const loadFloorRenders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('floor_renders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) {
      const grouped = {};
      data.forEach(r => {
        if (!grouped[r.floor_id]) grouped[r.floor_id] = [];
        grouped[r.floor_id].push(r);
      });
      setFloorRenders(grouped);
    }
  }, []);

  // Load available renders for picker
  const loadAvailableRenders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('renders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (data) setAvailableRenders(data);
  }, []);

  useEffect(() => { loadFloorRenders(); }, [loadFloorRenders]);

  const openPicker = () => {
    loadAvailableRenders();
    setShowRenderPicker(true);
    setSelectedRender(null);
  };

  const assignRender = async (render) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('floor_renders').insert({
      user_id: user.id,
      floor_id: activeFloor,
      render_id: render.id,
      image_url: render.image_url,
      label: render.prompt || `Render ${floor?.label}`,
    });
    setShowRenderPicker(false);
    loadFloorRenders();
  };

  const assignCurrentImage = async () => {
    if (!generatedImage) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('floor_renders').insert({
      user_id: user.id,
      floor_id: activeFloor,
      image_url: generatedImage,
      label: `Render ${floor?.label}`,
    });
    loadFloorRenders();
  };

  const removeFloorRender = async (id) => {
    await supabase.from('floor_renders').delete().eq('id', id);
    loadFloorRenders();
  };

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
    const isoAngle = Math.PI / 6;

    FLOORS.slice().reverse().forEach((f, i) => {
      const y = baseY - i * floorH;
      const isActive = f.id === activeFloor;
      const hasRenders = (floorRenders[f.id] || []).length > 0;
      const alpha = isActive ? 1 : hasRenders ? 0.6 : 0.3;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Top face
      ctx.beginPath();
      ctx.moveTo(cx, y - floorH);
      ctx.lineTo(cx + floorW * Math.cos(isoAngle), y - floorH + floorW * Math.sin(isoAngle) * 0.5);
      ctx.lineTo(cx, y - floorH + floorW * Math.sin(isoAngle));
      ctx.lineTo(cx - floorW * Math.cos(isoAngle), y - floorH + floorW * Math.sin(isoAngle) * 0.5);
      ctx.closePath();
      ctx.fillStyle = isActive ? f.color + '40' : hasRenders ? f.color + '20' : '#ffffff10';
      ctx.strokeStyle = isActive ? f.color : hasRenders ? f.color + '60' : '#ffffff30';
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

      // Render count badge
      if (hasRenders) {
        const badgeX = cx + floorW * Math.cos(isoAngle) - 10;
        const badgeY = y - floorH + floorW * Math.sin(isoAngle) * 0.5 - 5;
        ctx.globalAlpha = 1;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(floorRenders[f.id].length), badgeX, badgeY + 3);
      }

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

    // Height indicator
    ctx.strokeStyle = '#007AFF40';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx + floorW * Math.cos(isoAngle) + 30, baseY + floorH);
    ctx.lineTo(cx + floorW * Math.cos(isoAngle) + 30, baseY - FLOORS.length * floorH);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [activeFloor, zoom, rotation, floorRenders]);

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
      <div className="flex-1 relative mx-4 mb-4 bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden min-h-0">
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
          <p className="text-[8px] text-white/20 mt-1">{activeFloorRenders.length} render(s)</p>
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-xl rounded-full px-3 py-1.5 border border-white/10">
          <p className="text-[9px] text-white/40 font-bold">{Math.round(zoom * 100)}%</p>
        </div>
      </div>

      {/* Floor Renders Gallery */}
      {activeFloorRenders.length > 0 && (
        <div className="px-4 mb-3">
          <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-2 px-2">Renders — {floor?.label}</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {activeFloorRenders.map(r => (
              <div key={r.id} className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 group" style={{ borderColor: floor?.color + '40' }}>
                <img src={r.image_url} alt={r.label} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeFloorRender(r.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            <button
              onClick={openPicker}
              className="shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 text-white/20 hover:text-white/40 active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span className="text-[7px] font-bold uppercase">Adicionar</span>
            </button>
          </div>
        </div>
      )}

      {/* Floor Selector + Assign buttons */}
      <div className="px-4 mb-2">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Pavimentos</p>
          <div className="flex gap-1">
            {generatedImage && (
              <button onClick={assignCurrentImage} className="px-2 py-1.5 bg-[#007AFF]/10 rounded-lg text-[#007AFF] text-[8px] font-black uppercase tracking-wider active:scale-90 border border-[#007AFF]/20 mr-1 flex items-center gap-1">
                <Image size={10} /> Vincular Render
              </button>
            )}
            <button onClick={openPicker} className="px-2 py-1.5 bg-white/5 rounded-lg text-white/30 text-[8px] font-black uppercase tracking-wider active:scale-90 border border-white/5 flex items-center gap-1">
              <Layers size={10} /> Galeria
            </button>
            <button onClick={() => setActiveFloor(f => Math.min(f + 1, 3))} className="p-1.5 bg-white/5 rounded-lg text-white/30 active:scale-90 border border-white/5">
              <ChevronUp size={12} />
            </button>
            <button onClick={() => setActiveFloor(f => Math.max(f - 1, 0))} className="p-1.5 bg-white/5 rounded-lg text-white/30 active:scale-90 border border-white/5">
              <ChevronDown size={12} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {FLOORS.map(f => {
            const count = (floorRenders[f.id] || []).length;
            return (
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
                  {count > 0 ? (
                    <p className="text-[8px] font-bold" style={{ color: f.color }}>{count} render(s)</p>
                  ) : (
                    <p className="text-[8px] text-white/15">{f.modules.length} amb.</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Picker Modal */}
      {showRenderPicker && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-end justify-center">
          <div className="w-full max-w-lg bg-[#0f1729] border-t border-white/10 rounded-t-[2rem] p-6" style={{ animation: 'fadeInUp 0.3s ease-out', maxHeight: '70vh' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Vincular Render</h3>
                <p className="text-[10px] text-white/30 mt-1">Selecione um render para o <span style={{ color: floor?.color }}>{floor?.label}</span></p>
              </div>
              <button onClick={() => setShowRenderPicker(false)} className="p-2 text-white/40"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto space-y-2" style={{ maxHeight: '50vh' }}>
              {availableRenders.length === 0 ? (
                <div className="text-center py-12">
                  <Image size={32} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm font-bold">Nenhum render disponível</p>
                  <p className="text-white/15 text-[10px] mt-1">Gere renders pela IARA primeiro</p>
                </div>
              ) : availableRenders.map(r => (
                <button
                  key={r.id}
                  onClick={() => assignRender(r)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98] ${
                    selectedRender === r.id ? 'bg-[#007AFF]/10 border-[#007AFF]/30' : 'bg-white/5 border-white/5'
                  }`}
                >
                  <img src={r.image_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-white truncate">{r.prompt || 'Render sem descrição'}</p>
                    <p className="text-[9px] text-white/30 mt-1">{new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
