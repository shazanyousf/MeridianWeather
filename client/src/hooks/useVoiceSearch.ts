// useVoiceSearch hook - Web Speech API for voice search
'use client';
import { useState, useCallback, useEffect } from 'react';

interface VoiceSearchResult {
  transcript: string;
  listening: boolean;
  supported: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export const useVoiceSearch = (onResult?: (text: string) => void): VoiceSearchResult => {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize as false so server & first client render match (prevents hydration error).
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'webkitSpeechRecognition' in window);
  }, []);

  const startListening = useCallback(() => {
    if (!supported) {
      setError('Voice search is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      onResult?.(text);
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  }, [supported, onResult]);

  const stopListening = useCallback(() => {
    setListening(false);
  }, []);

  return { transcript, listening, supported, startListening, stopListening, error };
};
