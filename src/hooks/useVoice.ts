import { useState, useEffect, useCallback } from 'react';

export const useVoice = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speak = useCallback(
    (text: string) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        const premiumVoice =
          voices.find(
            (v) =>
              v.lang.includes('pt') &&
              (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'))
          ) || voices.find((v) => v.lang.includes('pt'));
        if (premiumVoice) utterance.voice = premiumVoice;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    },
    [voices]
  );

  const startListening = useCallback((onResult: (transcript: string) => void) => {
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Rec) {
      return false;
    }
    const recognition = new Rec();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => onResult(e.results[0][0].transcript);
    recognition.start();
    return true;
  }, []);

  return { speak, startListening, isListening };
};

export default useVoice;
