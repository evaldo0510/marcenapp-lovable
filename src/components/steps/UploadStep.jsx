import React, { memo } from 'react';
import { Camera, Send, Mic, MicOff, VolumeX, Pencil, Eye } from 'lucide-react';
import ChatBubble from '../ChatBubble';

const Logo = () => (
  <div className="w-20 h-20 relative">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
      <circle cx="50" cy="50" r="8" fill="#3b82f6" />
    </svg>
  </div>
);

function UploadStep({
  messages, chatLoading, scrollRef, chatInput, setChatInput,
  sendChat, triggerUpload, voice, generatedImage, openInspector,
  generateRender, setMaskEditorData
}) {
  return (
    <div className="h-full flex flex-col pb-20">
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-24 pb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-8 text-center">
            <Logo />
            <div className="mt-10 mb-8">
              <h2 className="text-2xl font-black leading-tight tracking-tight">
                MAPA DE<br /><span className="text-blue-500">PONTOS VIVOS.</span>
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
              <ChatBubble key={m.id} msg={m} onInspect={openInspector} onMaskEdit={(src) => setMaskEditorData(src)} onMaterialChange={(src) => setMaskEditorData(src)} />
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
          {voice.isSpeaking && (
            <button onClick={voice.stopSpeaking} className="p-2 text-blue-400 animate-pulse active:scale-90">
              <VolumeX size={18} />
            </button>
          )}
          <div className={`flex-1 border rounded-full px-4 py-3 flex items-center transition-all ${voice.isListening ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder={voice.isListening ? "🎤 Ouvindo..." : "Pergunte à IARA..."}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
            />
          </div>
          {chatInput.trim() ? (
            <button onClick={sendChat} className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all">
              <Send size={16} />
            </button>
          ) : (
            <button
              onClick={voice.isListening ? () => { voice.stopListening(); if (voice.transcript) setTimeout(sendChat, 300); } : voice.startListening}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${voice.isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600'} text-white`}
            >
              {voice.isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(UploadStep);
