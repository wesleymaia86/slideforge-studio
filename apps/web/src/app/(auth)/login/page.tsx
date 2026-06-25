'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, ArrowRight, Layers } from 'lucide-react'
import { BASE_URL } from '@/lib/api/client'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  function resetForm() {
    setName('')
    setEmail('')
    setPassword('')
    setError('')
    setSuccess('')
  }

  function switchMode(m: Mode) {
    resetForm()
    setMode(m)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (!result || result.error) {
        setError('E-mail ou senha inválidos.')
        setLoading(false)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Não foi possível conectar ao servidor.')
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name.trim() || undefined }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { message?: string | string[] }
        const msg = Array.isArray(data.message) ? data.message[0] : (data.message ?? 'Erro ao criar conta.')
        setError(String(msg))
        setLoading(false)
        return
      }

      setSuccess('Conta criada! Entrando…')
      const result = await signIn('credentials', { email, password, redirect: false })
      if (!result || result.error) {
        setError('Conta criada, mas o login automático falhou. Tente entrar manualmente.')
        setLoading(false)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Não foi possível conectar ao servidor.')
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'


  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-surface border-r border-border p-12 relative overflow-hidden shrink-0">
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
            Inteligência que<br />
            <span className="gradient-text-amber italic">molda</span> sua história
          </h1>
          <p className="text-text-muted text-sm leading-relaxed max-w-sm">
            Transforme conteúdo bruto em apresentações impactantes. Análise com IA,
            roteiros inteligentes e decks prontos para produção — em minutos.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-text-faint mb-3 uppercase tracking-widest">Projetos Recentes</p>
          <div className="relative">
            <div className="h-2 bg-surface-2 border-t border-b border-border flex items-center px-2 gap-2 mb-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-2 h-1 rounded-sm bg-border shrink-0" />
              ))}
            </div>
            <div className="flex gap-2 overflow-hidden">
              {[
                { title: 'Deck Série B', slides: 24, color: 'hsl(220 18% 12%)' },
                { title: 'Roadmap do Produto', slides: 18, color: 'hsl(230 16% 11%)' },
                { title: 'Kickoff de Vendas', slides: 32, color: 'hsl(215 20% 13%)' },
                { title: 'Conferência de IA', slides: 28, color: 'hsl(225 17% 10%)' },
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

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-amber-700 flex items-center justify-center shadow-amber-sm">
              <Layers className="w-4 h-4 text-[#0C0D0F]" />
            </div>
            <span className="font-display text-base text-text">SlideForge Studio</span>
          </div>

          <h2 className="font-display text-2xl text-text mb-1.5">
            {isLogin ? 'Bem-vindo de volta' : 'Criar sua conta'}
          </h2>
          <p className="text-text-muted text-sm mb-8">
            {isLogin ? 'Entre no seu workspace' : 'Preencha os dados para começar'}
          </p>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted tracking-wide" htmlFor="name">
                  Nome <span className="text-text-faint">(opcional)</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full h-10 bg-surface-2 border border-border rounded-[10px] px-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted tracking-wide" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@empresa.com"
                className="w-full h-10 bg-surface-2 border border-border rounded-[10px] px-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted tracking-wide" htmlFor="password">
                Senha {!isLogin && <span className="text-text-faint">(mín. 8 caracteres)</span>}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isLogin ? undefined : 8}
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
            {success && (
              <div className="px-3 py-2.5 rounded-lg bg-success/10 border border-success/25 text-xs text-success">
                {success}
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
                  {isLogin ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-text-faint text-center">
              {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(isLogin ? 'register' : 'login')}
                className="text-accent hover:text-accent-light transition-colors underline underline-offset-2"
              >
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
