import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { BASE_URL } from '@/lib/api/client'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
  interface User {
    accessToken: string
    role: string
  }
}

type AuthJwt = {
  accessToken?: string
  role?: string
  sub?: string
}

const config: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null

          const data = await res.json()
          const accessToken = data.accessToken ?? data.access_token
          if (!accessToken) return null

          return {
            id: data.user?.id ?? '',
            email: data.user?.email ?? String(credentials.email),
            name: data.user?.name ?? data.user?.email ?? '',
            role: data.user?.isSuperAdmin ? 'admin' : 'user',
            accessToken,
          }
        } catch (err) {
          console.log('[auth] API unreachable, checking demo credentials:', err)
          const allowDemoLogin =
            process.env.ALLOW_DEMO_LOGIN === 'true' &&
            process.env.NODE_ENV !== 'production'

          console.log('[auth] allowDemoLogin:', allowDemoLogin, 'ALLOW_DEMO_LOGIN env:', process.env.ALLOW_DEMO_LOGIN)

          const emailVal = String(credentials.email)
          const passwordVal = String(credentials.password)
          
          if (allowDemoLogin && emailVal === 'demo@slideforge.io' && passwordVal === 'demo') {
            console.log('[auth] Demo login successful')
            return {
              id: 'demo-user-1',
              email: emailVal,
              name: 'Demo User',
              role: 'admin',
              accessToken: 'demo-token',
            }
          }
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      const jwt = token as AuthJwt
      if (user) {
        jwt.accessToken = user.accessToken
        jwt.role = user.role
        jwt.sub = user.id ?? jwt.sub
      }
      return jwt
    },
    async session({ session, token }) {
      const jwt = token as AuthJwt
      return {
        ...session,
        accessToken: jwt.accessToken ?? '',
        user: {
          ...session.user,
          id: jwt.sub ?? '',
          role: jwt.role ?? 'user',
        },
      }
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicPath = nextUrl.pathname === '/login'

      if (isPublicPath) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
        return true
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl))
      }
      return true
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
