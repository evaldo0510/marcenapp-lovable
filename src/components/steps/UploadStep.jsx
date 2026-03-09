import React, { memo } from 'react';
import { Camera, Send, Mic, MicOff, VolumeX, Pencil, Eye } from 'lucide-react';
import ChatBubble from '../ChatBubble';
import HexLogo from '../HexLogo';

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
            {/* Hero hex logo */}
            <HexLogo size={80} active />

            <div className="mt-8 mb-10">
              <h2 className="text-2xl font-black leading-tight tracking-tight">
                ALVENARIA<br />
                <span className="text-blue-500">DIGITAL.</span>
              </h2>
              <p className="text-white/25 text-[11px] mt-4 max-w-[260px] leading-relaxed font-medium">
                Suba seu rascunho ou foto do ambiente.<br />
                A IARA irá materializar com fidelidade 1:1.
              </p>
            </div>

            {/* Upload CTA */}
            <button
              onClick={triggerUpload}
              className="group flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all border-b-4 border-blue-800"
            >
              <Camera size={20} className="group-active:rotate-12 transition-transform" />
              Abrir Ambiente
            </button>

            {/* Subtle hint */}
            <div className="mt-8 flex items-center gap-2 text-white/15">
              <div className="w-8 h-px bg-white/10" />
              <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Fidelidade Industrial</span>
              <div className="w-8 h-px bg-white/10" />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                msg={m}
                onInspect={openInspector}
                onMaskEdit={(src) => setMaskEditorData(src)}
                onMaterialChange={(src) => setMaskEditorData(src)}
              />
            ))}
            {chatLoading && (
              <div className="flex justify-start px-3 mb-2">
                <div className="bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 border border-white/[0.04]">
                  <div className="flex gap-1.5">
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

      {/* Input bar */}
      <div className="px-4 pb-20 pt-3 border-t border-white/[0.04] bg-[#020617]">
        {generatedImage && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            <button
              onClick={() => openInspector(generatedImage)}
              className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95"
            >
              <Pencil size={12} /> Editar Render
            </button>
            <button
              onClick={() => generateRender('multi')}
              className="shrink-0 px-4 py-2 bg-white/[0.06] text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 border border-white/[0.08]"
            >
              <Eye size={12} /> Multi-Vista
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={triggerUpload} className="p-2.5 text-white/30 hover:text-white/60 active:scale-90 transition-all">
            <Camera size={20} />
          </button>

          {voice.isSpeaking && (
            <button onClick={voice.stopSpeaking} className="p-2 text-blue-400 animate-pulse active:scale-90">
              <VolumeX size={18} />
            </button>
          )}

          <div className={`flex-1 rounded-full px-4 py-3 flex items-center transition-all border ${
            voice.isListening
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-white/[0.04] border-white/[0.08] focus-within:border-blue-500/40'
          }`}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder={voice.isListening ? "🎤 Ouvindo..." : "Pergunte à IARA..."}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
            />
          </div>

          {chatInput.trim() ? (
            <button
              onClick={sendChat}
              className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-90 transition-all"
            >
              <Send size={16} />
            </button>
          ) : (
            <button
              onClick={voice.isListening ? () => { voice.stopListening(); if (voice.transcript) setTimeout(sendChat, 300); } : voice.startListening}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${
                voice.isListening ? 'bg-red-500 animate-pulse shadow-red-500/20' : 'bg-blue-600 shadow-blue-600/20'
              } text-white`}
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
