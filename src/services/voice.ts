import type { AppLanguage } from '@/types';

export interface VoiceError {
  type: string;
  message: string;
}

type RecognitionInstance = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
};

type SpeechRecognitionCtor = new () => RecognitionInstance;

function getCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isVoiceSupported(): boolean {
  return getCtor() !== null;
}

export class VoiceRecognizer {
  private rec: RecognitionInstance | null = null;
  private lang: AppLanguage = 'en-US';
  private listening = false;

  setLanguage(lang: AppLanguage): void {
    this.lang = lang;
  }

  isListening(): boolean {
    return this.listening;
  }

  start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: VoiceError) => void,
    onEnd: () => void,
  ): void {
    const Ctor = getCtor();
    if (!Ctor) {
      onError({ type: 'not-supported', message: 'Voice recognition not supported in this browser' });
      return;
    }
    if (this.listening && this.rec) {
      this.rec.abort();
      this.listening = false;
    }
    const rec = new Ctor();
    rec.lang = this.lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        if (result.isFinal) isFinal = true;
      }
      onResult(transcript, isFinal);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.listening = false;
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      const friendlyMap: Record<string, string> = {
        network: 'Voice service could not connect. Check internet or use the typing box below.',
        'not-allowed': 'Microphone access denied. Please allow microphone permissions.',
        'service-not-allowed': 'Voice service unavailable. Use the typing box below.',
        'audio-capture': 'No microphone detected. Use the typing box below.',
      };
      onError({
        type: event.error,
        message: friendlyMap[event.error] || `Voice error: ${event.error}`,
      });
    };

    rec.onend = () => {
      this.listening = false;
      onEnd();
    };

    this.rec = rec;
    this.listening = true;
    try {
      rec.start();
    } catch {
      this.listening = false;
      onError({ type: 'start-failed', message: 'Could not start voice recognition' });
    }
  }

  stop(): void {
    if (this.rec && this.listening) {
      this.rec.stop();
      this.listening = false;
    }
  }
}

export function speak(text: string, lang: AppLanguage = 'en-US'): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
