'use client'

interface FormFeedbackProps {
  error?: string | null
  success?: string | null
}

export function FormFeedback({ error, success }: FormFeedbackProps) {
  if (!error && !success) return null
  return (
    <div
      className={
        error
          ? 'px-3 py-2.5 rounded-lg bg-error/10 border border-error/25 text-xs text-error'
          : 'px-3 py-2.5 rounded-lg bg-success/10 border border-success/25 text-xs text-success'
      }
      role="alert"
    >
      {error ?? success}
    </div>
  )
}
