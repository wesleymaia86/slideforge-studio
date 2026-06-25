import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

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

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    role: string
    sub: string
  }
}

const config: NextAuthConfig = {
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
          const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null

          const data = await res.json()
          if (!data.access_token) return null

          return {
            id: data.user?.id ?? '',
            email: data.user?.email ?? String(credentials.email),
            name: data.user?.name ?? '',
            role: data.user?.role ?? 'user',
            accessToken: data.access_token,
          }
        } catch {
          // API unreachable — allow demo login in development
          if (process.env.NODE_ENV === 'development') {
            const email = String(credentials.email)
            const password = String(credentials.password)
            if (email === 'demo@slideforge.io' && password === 'demo') {
              return {
                id: 'demo-user-1',
                email,
                name: 'Demo User',
                role: 'admin',
                accessToken: 'demo-token',
              }
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
      if (user) {
        token.accessToken = user.accessToken
        token.role = user.role
        token.sub = user.id ?? token.sub
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
        },
      }
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicPath = ['/login'].includes(nextUrl.pathname)

      if (isPublicPath) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl))
        return true
      }

      if (!isLoggedIn) return false
      return true
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
