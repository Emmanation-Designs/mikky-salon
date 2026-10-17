import React, { useState } from 'react';
import { X, Database, Copy, Check, ExternalLink, ShieldCheck, FileCode } from 'lucide-react';
import { ADMIN_EMAIL } from '../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const adminPromoteSql = `-- Manual Admin Promotion Query for Supabase SQL Editor:
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = '${ADMIN_EMAIL}'
);`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 border border-red-600/30 text-red-500">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Supabase Configuration Guide</h3>
              <p className="text-xs text-neutral-400">Step-by-step instructions to connect your live Supabase database & storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-900 hover:text-white"
            aria-label="Close setup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-6 text-xs text-neutral-300">
          
          {/* Step 1: Create Supabase Project */}
          <div className="rounded-xl border border-neutral-900 bg-black/50 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Step 1: Create or Open a Supabase Project</h4>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold"
              >
                <span>supabase.com/dashboard</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              If you have not already created a project, create a new project in your Supabase account (e.g. named <strong>mikkys-barbing-salon</strong>).
            </p>
          </div>

          {/* Step 2: Environment Variables */}
          <div className="rounded-xl border border-neutral-900 bg-black/50 p-5 space-y-3">
            <h4 className="font-bold text-white text-sm">Step 2: Add Environment Variables</h4>
            <p className="text-neutral-400">
              Go to your Supabase project settings: <strong>Project Settings &rarr; API &rarr; Project API keys</strong> and copy:
            </p>
            
            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between rounded-lg bg-neutral-900 px-3.5 py-2.5 border border-neutral-800">
                <span className="text-neutral-200">VITE_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co</span>
                <button
                  onClick={() => copyToClipboard('VITE_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"', 'url')}
                  className="text-neutral-400 hover:text-white ml-2"
                >
                  {copiedKey === 'url' ? <Check className="h-4 w-4 text-red-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-neutral-900 px-3.5 py-2.5 border border-neutral-800">
                <span className="text-neutral-200 truncate max-w-[500px]">VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</span>
                <button
                  onClick={() => copyToClipboard('VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."', 'anon')}
                  className="text-neutral-400 hover:text-white ml-2"
                >
                  {copiedKey === 'anon' ? <Check className="h-4 w-4 text-red-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p className="text-neutral-500 text-[11px]">
              Add these variables in your deployment settings (Vercel Project Settings &rarr; Environment Variables) or in your local <code className="text-neutral-300">.env</code> file.
            </p>
          </div>

          {/* Step 3: Run SQL Migrations */}
          <div className="rounded-xl border border-neutral-900 bg-black/50 p-5 space-y-3">
            <h4 className="font-bold text-white text-sm">Step 3: Execute Database Migrations in SQL Editor</h4>
            <p className="text-neutral-400 leading-relaxed">
              Open your Supabase <strong>SQL Editor</strong> tab and run the SQL migration files included in this codebase:
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 font-mono text-[11px]">
                <FileCode className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-white flex-1 truncate">/supabase/migrations/20261016000001_initial_mikkys_salon.sql</span>
                <span className="text-neutral-500 text-[10px]">Schema & RLS</span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 font-mono text-[11px]">
                <FileCode className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-white flex-1 truncate">/supabase/migrations/20261016000002_seed_initial_services.sql</span>
                <span className="text-neutral-500 text-[10px]">Initial Catalog & Haircuts</span>
              </div>
            </div>
          </div>

          {/* Step 4: Administrator Account Provisioning */}
          <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-500" />
              <h4 className="font-bold text-white text-sm">Step 4: Provisioning the First Administrator</h4>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              1. Sign up on the website or Supabase Auth using the authorized admin email: <strong className="text-white font-mono">{ADMIN_EMAIL}</strong>.
              <br />
              2. The database trigger in migration 1 automatically assigns <code className="text-red-400 font-mono">role = 'admin'</code> to this specific email address.
              <br />
              3. You can also run this SQL query in the Supabase SQL editor at any time to verify or manually promote the administrator:
            </p>

            <div className="relative rounded-lg bg-black p-3 font-mono text-[11px] text-neutral-300 border border-neutral-800">
              <pre className="overflow-x-auto">{adminPromoteSql}</pre>
              <button
                onClick={() => copyToClipboard(adminPromoteSql, 'sql')}
                className="absolute top-2 right-2 rounded p-1 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800"
                title="Copy SQL"
              >
                {copiedKey === 'sql' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
