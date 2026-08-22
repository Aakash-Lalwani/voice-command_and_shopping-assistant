import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Send, AlertCircle, RefreshCw } from 'lucide-react';
import type { VoiceError } from '@/services/voice';

interface Props {
  listening: boolean;
  transcript: string;
  supported: boolean;
  voiceError: VoiceError | null;
  onToggle: () => void;
  onTextSubmit: (text: string) => void;
  micButtonOnly?: boolean;
  bottomBarOnly?: boolean;
}

export function VoiceButton({ listening, transcript, supported, voiceError, onToggle, onTextSubmit, micButtonOnly, bottomBarOnly }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (voiceError && voiceError.type === 'network') {
      inputRef.current?.focus();
    }
  }, [voiceError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onTextSubmit(trimmed);
    setText('');
  };

  const micButton = (
    <div className="relative pointer-events-auto">
      {listening && (
        <>
          <span className="absolute inset-0 rounded-full bg-rose-400/40 animate-ping pointer-events-none" />
          <span className="absolute inset-0 -m-4 rounded-full bg-rose-400/20 animate-pulse pointer-events-none" />
        </>
      )}
      <button
        onClick={onToggle}
        disabled={!supported}
        aria-label={listening ? 'Stop listening' : 'Start listening'}
        className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
          listening
            ? 'bg-rose-500 text-white scale-110'
            : 'bg-white text-slate-700 hover:bg-slate-50 hover:scale-105 dark:bg-slate-800 dark:text-slate-200'
        } ${!supported ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {listening ? (
          <Mic className="h-8 w-8" />
        ) : (
          <MicOff className="h-8 w-8" />
        )}
      </button>
    </div>
  );

  const statusLabel = (
    <div className="min-h-[2rem] text-center">
      {listening ? (
        <p className="text-sm font-medium text-rose-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Listening...
        </p>
      ) : (
        <p className="text-xs text-slate-400">
          {supported ? 'Tap to speak a command' : 'Voice not supported in this browser'}
        </p>
      )}
    </div>
  );

  const transcriptDisplay = transcript && !voiceError && (
    <div className="max-w-md rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-center">
      <p className="text-sm text-slate-700 dark:text-slate-200 italic">"{transcript}"</p>
    </div>
  );

  const networkError = voiceError && voiceError.type === 'network' && (
    <div className="w-full max-w-md rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3 flex flex-col items-center gap-2 pointer-events-auto">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm font-medium text-center">{voiceError.message}</p>
      </div>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 rounded-lg bg-amber-500 text-white px-4 py-1.5 text-xs font-semibold hover:bg-amber-600 transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Try Again
      </button>
    </div>
  );

  const textForm = (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Or type a command (e.g., Add milk)"
          className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none"
          aria-label="Type a command"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white disabled:opacity-30 hover:bg-rose-600 transition-colors"
          aria-label="Submit command"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );

  if (micButtonOnly) {
    return (
      <div className="flex flex-col items-center gap-2 pointer-events-none">
        {micButton}
        {statusLabel}
        {transcriptDisplay}
        {networkError}
      </div>
    );
  }

  if (bottomBarOnly) {
    return (
      <div className="flex flex-col items-center gap-2">
        {textForm}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {micButton}
      {statusLabel}
      {transcriptDisplay}
      {networkError}
      {textForm}
    </div>
  );
}
