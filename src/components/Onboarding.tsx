import { useState } from 'react';
import { X, Mic, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function Onboarding({ onClose }: Props) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Mic className="h-12 w-12 text-rose-500" />,
      title: 'Talk to your cart',
      desc: 'Tap the mic and say things like "add 2 liters of milk" or "remove eggs from my list". VoiceCart understands natural speech.',
    },
    {
      icon: <Sparkles className="h-12 w-12 text-amber-500" />,
      title: 'Smart suggestions',
      desc: 'Get substitutes for any item, see what is in season, and get suggestions based on your shopping history.',
    },
    {
      icon: <CheckCircle2 className="h-12 w-12 text-emerald-500" />,
      title: 'Stay organized',
      desc: 'Items are auto-categorized into groups. Check them off as you shop, and your list syncs across devices.',
    },
    {
      icon: <ShoppingBag className="h-12 w-12 text-sky-500" />,
      title: 'Voice search',
      desc: 'Say "find organic apples under 5 dollars" to search our catalog and add results directly to your list.',
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 shadow-2xl p-8 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close onboarding"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-700/50 p-6">
            {current.icon}
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{current.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">{current.desc}</p>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-rose-500' : 'w-2 bg-slate-300 dark:bg-slate-600'}`}
            />
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 rounded-xl py-3 text-sm font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
            className="flex-1 rounded-xl py-3 text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
          >
            {isLast ? 'Get started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
