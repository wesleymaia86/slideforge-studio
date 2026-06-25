export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg text-text">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-text-muted">The page you requested does not exist.</p>
      </div>
    </main>
  )
}
