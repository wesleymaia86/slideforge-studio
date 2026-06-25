'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Layers } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@slideforge.io')
  const [password, setPassword] = useState('demo')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn('credentials', {
        email,
        password,
        redirectTo: '/dashboard',
      })
    } catch (err: unknown) {
      setLoading(false)
      // NextAuth throws a redirect — let it happen
      const isRedirect = err && typeof err === 'object' && 'digest' in err && String((err as {digest?: string}).digest).includes('NEXT_REDIRECT')
      if (!isRedirect) {
        setError('Invalid credentials. Try demo@slideforge.io / demo')
      }
    }
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-surface border-r border-border p-12 relative overflow-hidden shrink-0">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-amber-700 flex items-center justify-center shadow-amber">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-[#0C0D0F]">
                <rect x="1" y="3" width="6" height="4.5" rx="1" fill="currentColor" />
                <rect x="9" y="3" width="6" height="4.5" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="1" y="9" width="6" height="4" rx="1" fill="currentColor" opacity="0.7" />
                <rect x="9" y="9" width="6" height="4" rx="1" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <span className="font-display text-lg text-text">SlideForge Studio</span>
          </div>

          <h1 className="font-display text-4xl text-text leading-tight mb-4">
            Intelligence that<br />
            <span className="gradient-text-amber italic">shapes</span> your story
          </h1>
          <p className="text-text-muted text-sm leading-relaxed max-w-sm">
            Transform raw content into compelling presentations. AI-powered analysis, 
            smart outlines, and production-ready decks — in minutes.
          </p>
        </div>

        {/* Slide filmstrip preview */}
        <div className="relative z-10">
          <p className="text-xs text-text-faint mb-3 uppercase tracking-widest">Recent Projects</p>
          <div className="relative">
            {/* Filmstrip sprockets */}
            <div className="h-2 bg-surface-2 border-t border-b border-border flex items-center px-2 gap-2 mb-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-2 h-1 rounded-sm bg-border shrink-0" />
              ))}
            </div>
            <div className="flex gap-2 overflow-hidden">
              {[
                { title: 'Series B Deck', slides: 24, color: 'hsl(220 18% 12%)' },
                { title: 'Product Roadmap', slides: 18, color: 'hsl(230 16% 11%)' },
                { title: 'Sales Kickoff', slides: 32, color: 'hsl(215 20% 13%)' },
                { title: 'AI Conference', slides: 28, color: 'hsl(225 17% 10%)' },
              ].map((p, i) => (
                <div
                  key={i}
                  className="relative rounded overflow-hidden border border-border shrink-0"
                  style={{ width: 88, aspectRatio: '16/9', background: p.color }}
                >
                  <div className="absolute inset-0 p-2 flex flex-col justify-between">
                    <div className="w-8 h-0.5 bg-accent/40 rounded" />
                    <div className="space-y-0.5">
                      <div className="w-12 h-0.5 bg-white/20 rounded" />
                      <div className="w-8 h-0.5 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                      backgroundSize: '64px',
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 flex items-end justify-between">
                    <span className="text-[5px] text-white/60 truncate">{p.title}</span>
                    <span className="text-[5px] text-white/40">{p.slides}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-2 bg-surface-2 border-t border-b border-border flex items-center px-2 gap-2 mt-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-2 h-1 rounded-sm bg-border shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-amber-700 flex items-center justify-center shadow-amber-sm">
              <Layers className="w-4 h-4 text-[#0C0D0F]" />
            </div>
            <span className="font-display text-base text-text">SlideForge Studio</span>
          </div>

          <h2 className="font-display text-2xl text-text mb-1.5">Welcome back</h2>
          <p className="text-text-muted text-sm mb-8">Sign in to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted tracking-wide" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full h-10 bg-surface-2 border border-border rounded-[10px] px-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted tracking-wide" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-10 bg-surface-2 border border-border rounded-[10px] px-3 pr-10 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-error/10 border border-error/25 text-xs text-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-accent hover:bg-accent-light text-[#0C0D0F] font-semibold text-sm rounded-[10px] transition-all duration-150 flex items-center justify-center gap-2 shadow-amber active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-text-faint text-center">
              Demo credentials: <span className="text-text-muted font-mono">demo@slideforge.io</span> / <span className="text-text-muted font-mono">demo</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
