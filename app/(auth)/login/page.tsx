'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('your_supabase') && !url.includes('your-project');
};

type Mode = 'login' | 'signup' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const mockFallback = () => {
    setTimeout(() => router.push('/dashboard'), 800);
  };

  // ── Google OAuth ──────────────────────────────────────────────
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

  // ── Email + Password Login ────────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setMessage(null);

    if (!isSupabaseConfigured()) { mockFallback(); return; }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ───────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    setLoading(true);
    setMessage(null);

    if (!isSupabaseConfigured()) { mockFallback(); return; }
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      
      if (data?.session) {
        setMessage({ text: 'Sign up successful! Redirecting to dashboard...', type: 'success' });
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setMessage({ text: 'Check your email to confirm your account!', type: 'success' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ───────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setMessage({ text: 'Reset link sent! (mock mode)', type: 'success' });
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      setMessage({ text: 'Password reset link sent! Check your inbox.', type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full h-11 px-3 pl-10 rounded-xl text-sm outline-none transition-all
    border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)]
    text-white placeholder-[rgba(255,255,255,0.4)]
    focus:border-[var(--color-brand-purple)] focus:bg-[rgba(255,255,255,0.1)]
  `;

  return (
    <div className="min-h-screen flex font-sans" style={{ background: '#0a0a12' }}>
      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a3d 0%, #0d0020 50%, #0a0a12 100%)' }}>
        {/* Decorative orbs */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-brand-purple) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-brand-purple)' }}>
            <BrainCircuit size={18} color="white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FlowMind</span>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your AI‑powered<br />
              <span style={{ color: 'var(--color-brand-purple)' }}>productivity</span><br />
              companion.
            </h1>
            <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              FlowMind learns your work patterns, priorities, and deadlines — then helps you get more done with less stress.
            </p>
          </div>

          {[
            { icon: '🎯', text: 'AI-sorted task priorities' },
            { icon: '📅', text: 'Smart daily routine scheduling' },
            { icon: '🔔', text: 'Deadline push notifications' },
            { icon: '🧠', text: 'Gemini-powered insights' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.text}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] relative z-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2025 FlowMind. All rights reserved.
        </p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-brand-purple)' }}>
              <BrainCircuit size={16} color="white" />
            </div>
            <span className="text-white font-bold">FlowMind</span>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' && 'Welcome back'}
              {mode === 'signup' && 'Create account'}
              {mode === 'forgot' && 'Reset password'}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {mode === 'login' && 'Sign in to continue to FlowMind'}
              {mode === 'signup' && 'Start your productivity journey today'}
              {mode === 'forgot' && "We'll send you a reset link"}
            </p>
          </div>

          {/* Alert */}
          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm ${
              message.type === 'error'
                ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                : 'border text-emerald-300'
            }`}
              style={message.type === 'success' ? { background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' } : {}}>
              {message.text}
            </div>
          )}

          {/* Google OAuth button (shown on login and signup) */}
          {mode !== 'forgot' && (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-3 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
              </svg>
              Continue with Google
            </button>
          )}

          {mode !== 'forgot' && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={
            mode === 'login' ? handleEmailLogin
            : mode === 'signup' ? handleSignUp
            : handleForgotPassword
          } className="space-y-3">
            {mode === 'signup' && (
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={inputClass + ' pr-10'}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => { setMode('forgot'); setMessage(null); }}
                  className="text-xs transition-colors"
                  style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] mt-2"
              style={{ background: 'var(--color-brand-purple)', color: 'white', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {mode === 'login' && <><Sparkles size={15} /> Sign In</>}
                  {mode === 'signup' && <><ArrowRight size={15} /> Create Account</>}
                  {mode === 'forgot' && <><Mail size={15} /> Send Reset Link</>}
                </>
              )}
            </button>
          </form>

          {/* Mode switcher */}
          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {mode === 'login' && (
              <>Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('signup'); setMessage(null); }}
                  className="font-semibold text-white hover:underline">Sign up</button>
              </>
            )}
            {mode === 'signup' && (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setMessage(null); }}
                  className="font-semibold text-white hover:underline">Sign in</button>
              </>
            )}
            {mode === 'forgot' && (
              <button onClick={() => { setMode('login'); setMessage(null); }}
                className="font-semibold text-white hover:underline">← Back to sign in</button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
