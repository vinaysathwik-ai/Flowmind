'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase') && !url.includes('your-project');
};

const FEATURES = [
  { title: 'Autonomous AI Planning', desc: 'FlowMind optimizes your daily agenda and focus blocks.' },
  { title: 'Smart Push Notifications', desc: 'Native browser alerts for upcoming deadlines.' },
  { title: 'Streak & Compliance Tracking', desc: 'Visualize your consistency with a beautiful heat map.' },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const mockFallback = () => {
    setTimeout(() => router.push('/dashboard'), 800);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    if (!isSupabaseConfigured()) { mockFallback(); return; }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google login failed';
      setMessage({ text: msg, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0E0C15]" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      {/* Left panel – brand info */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden border-r border-white/5 bg-[radial-gradient(ellipse_at_top_right,rgba(83,74,183,0.15),transparent_60%)]">
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-brand-purple)] shadow-[0_0_20px_rgba(83,74,183,0.3)]">
            <BrainCircuit size={18} color="white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FlowMind</span>
        </div>

        <div className="space-y-6 max-w-lg relative z-10 my-auto">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-brand-purple)] bg-[var(--color-purple-light)]/10 px-2.5 py-1 rounded-full border border-[var(--color-brand-purple)]/20">
              Agentic Productivity
            </span>
            <h1 className="text-4xl font-bold text-white tracking-tight leading-[1.1]">
              Achieve deep focus,<br />automatically.
            </h1>
          </div>

          <div className="space-y-4 pt-4">
            {FEATURES.map((feat, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] text-emerald-400 font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">{feat.title}</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] relative z-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2026 FlowMind. All rights reserved.
        </p>
      </div>

      {/* Right panel – login button */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-brand-purple)' }}>
              <BrainCircuit size={16} color="white" />
            </div>
            <span className="text-white font-bold">FlowMind</span>
          </div>

          {/* Header */}
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-white">
              Welcome to FlowMind
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Sign in with your Google Account to continue
            </p>
          </div>

          {/* Alert */}
          {message && (
            <div className="rounded-xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/30 text-red-300">
              {message.text}
            </div>
          )}

          {/* Google OAuth button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-xl flex items-center justify-center gap-3 text-sm font-semibold transition-all hover:bg-white/10 active:scale-[0.98] shadow-sm disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
