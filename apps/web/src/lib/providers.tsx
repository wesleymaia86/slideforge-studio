'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { SessionProvider, signOut } from 'next-auth/react'
import { ApiError } from '@/lib/api/client'

const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools),
  { ssr: false },
)

function handleGlobalError(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    signOut({ redirectTo: '/login' })
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleGlobalError }),
    mutationCache: new MutationCache({ onError: handleGlobalError }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error: unknown) => {
          const status = (error as { status?: number })?.status
          if (status === 401 || status === 403 || status === 404) return false
          return failureCount < 2
        },
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </SessionProvider>
  )
}
