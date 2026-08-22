import { AlertTriangle, Key } from 'lucide-react';

interface Props {
  missing: string[];
}

export function SetupScreen({ missing }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-lg w-full rounded-3xl bg-white dark:bg-slate-800 shadow-xl p-8">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-4">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Setup required</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            VoiceCart needs a few environment variables to run. Create a <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">.env</code> file in the project root with the following:
          </p>
        </div>

        <div className="space-y-2 mb-6">
          {missing.map((v) => (
            <div
              key={v}
              className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3"
            >
              <Key className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <code className="text-sm text-slate-700 dark:text-slate-200 font-mono">{v}</code>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-300 mb-2 font-semibold">Example:</p>
          <pre className="text-xs text-slate-600 dark:text-slate-300 font-mono overflow-x-auto">
{`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_GEMINI_API_KEY=your_gemini_key`}
          </pre>
        </div>

        <p className="text-xs text-slate-400 mt-4 text-center">
          After saving your .env file, restart the dev server.
        </p>
      </div>
    </div>
  );
}
