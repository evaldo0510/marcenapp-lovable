import { useState, useCallback } from 'react';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

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
