import { useEffect, useState } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;
let externalAdd: ((m: string, t?: ToastItem['type']) => void) | null = null;

export function showToast(message: string, type: ToastItem['type'] = 'info'): void {
  if (externalAdd) externalAdd(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    externalAdd = (message: string, type: ToastItem['type'] = 'info') => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
    return () => {
      externalAdd = null;
    };
  }, []);

  return (
    <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:max-w-sm z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg animate-toast-in flex items-center gap-2 ${
            t.type === 'success'
              ? 'bg-emerald-500 text-white'
              : t.type === 'error'
                ? 'bg-rose-500 text-white'
                : 'bg-slate-700 text-white'
          }`}
        >
          {t.type === 'success' && <span>✓</span>}
          {t.type === 'error' && <span>✕</span>}
          {t.type === 'info' && <span>ℹ</span>}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
