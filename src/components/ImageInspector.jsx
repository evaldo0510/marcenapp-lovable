import React from 'react';
import { X, Pencil, Layers, Maximize2, ZoomIn } from 'lucide-react';

export default function ImageInspector({ photo, onCancel, onSelectForEdit, onGenerateMultiView }) {
  return (
    <div className="fixed inset-0 z-[400] bg-[#020617] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button onClick={onCancel} className="p-2 text-white/60 active:scale-90">
          <X size={20} />
        </button>
        <div className="text-center">
          <p className="text-xs font-black text-white uppercase tracking-widest">Visor Industrial</p>
          <p className="text-[9px] text-white/30 mt-0.5">Análise 8K em Matriz</p>
        </div>
        <div className="w-8" />
      </header>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img src={photo} alt="Inspection" className="max-w-full max-h-full object-contain rounded-2xl" />
      </div>

      {/* Actions */}
      <div className="px-4 pb-8 flex gap-3">
        <button 
          onClick={() => onSelectForEdit(photo)} 
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-[#020617] rounded-full font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl"
        >
          <Pencil size={16} /> Mudar Item
        </button>
        <button 
          onClick={() => onGenerateMultiView(photo)} 
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-lg"
        >
          <Layers size={16} /> Gerar Vistas
        </button>
      </div>
    </div>
  );
}
