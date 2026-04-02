'use client';

import { useState, useEffect } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: Record<string, string>) => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) { onLogin(data.user); onClose(); }
      else { setError(data.error || 'Invalid email or password.'); }
    } catch { setError('An error occurred. Please try again.'); }
    finally { setLoading(false); }
  };

  const inputClass = 'w-full px-4 py-3 border border-[#1E2D25] rounded-xl bg-[#0A0F0D] focus:bg-[#0D1210] text-white text-base transition-colors placeholder:text-[#5A6E62]';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111916] w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl shadow-black/50 overflow-hidden border border-[#1E2D25]">
        <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-[#2A3D32] rounded-full" /></div>
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Sign In</h2>
              <p className="text-sm text-[#5A6E62] mt-0.5">Use your Contrib account</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl text-[#5A6E62] hover:text-white hover:bg-white/5 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[#8B9E93] mb-1.5">Email</label>
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[#8B9E93] mb-1.5">Password</label>
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} placeholder="Your password" />
            </div>
            {error && (
              <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3.5 px-4 rounded-xl hover:bg-green-500 disabled:bg-green-800 transition-all font-semibold text-base shadow-md shadow-green-600/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
