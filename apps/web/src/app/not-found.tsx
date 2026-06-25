import { t } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg text-text">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t('notFound.title')}</h1>
        <p className="mt-2 text-text-muted">{t('notFound.description')}</p>
      </div>
    </main>
  )
}
