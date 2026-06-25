'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Download, FileText, Film, Globe, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useExports, useCreateExport } from '@/lib/api/hooks'
import { Button, EmptyState } from '@slideforge/ui'
import type { ExportConfig } from '@/lib/api/types'

const FORMAT_OPTIONS = [
  { id: 'pptx' as const, label: 'PowerPoint', ext: '.pptx', description: 'Editable presentation for Microsoft PowerPoint', icon: <FileText className="w-6 h-6" />, gradient: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/25', color: 'text-orange-400' },
  { id: 'pdf' as const, label: 'PDF', ext: '.pdf', description: 'Fixed-layout document, ideal for distribution', icon: <FileText className="w-6 h-6" />, gradient: 'from-red-500/20 to-red-500/5', border: 'border-red-500/25', color: 'text-red-400' },
  { id: 'html' as const, label: 'Web Presentation', ext: '.html', description: 'Interactive browser-based presentation', icon: <Globe className="w-6 h-6" />, gradient: 'from-info/20 to-info/5', border: 'border-info/25', color: 'text-info' },
  { id: 'png' as const, label: 'PNG Images', ext: '.zip', description: 'Export each slide as a high-res image', icon: <Film className="w-6 h-6" />, gradient: 'from-success/20 to-success/5', border: 'border-success/25', color: 'text-success' },
]

export default function ExportsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: exports, isLoading } = useExports(id)
  const createExport = useCreateExport(id)
  const display = exports ?? []
  const [quality, setQuality] = useState<'draft' | 'standard' | 'high'>('high')
  const [includeNotes, setIncludeNotes] = useState(false)

  const handleExport = (format: ExportConfig['format']) => {
    createExport.mutate({ format, quality, includeNotes })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <Download className="w-5 h-5 text-accent" />
            <h1 className="font-display text-2xl text-text">Exports</h1>
          </div>
          <p className="text-text-muted text-sm">Download your presentation in any format.</p>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text mb-4">Export Format</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
            {FORMAT_OPTIONS.map((fmt) => (
              <div key={fmt.id} className={`bg-gradient-to-br ${fmt.gradient} border ${fmt.border} rounded-xl p-4 flex flex-col gap-3`}>
                <div className={fmt.color}>{fmt.icon}</div>
                <div>
                  <p className="font-semibold text-sm text-text">{fmt.label}</p>
                  <p className="text-xs text-text-muted leading-relaxed mt-0.5">{fmt.description}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-auto"
                  onClick={() => handleExport(fmt.id)}
                  loading={createExport.isPending && createExport.variables?.format === fmt.id}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Export {fmt.ext}
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Quality:</span>
              {(['draft', 'standard', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`h-7 px-3 rounded-lg text-xs transition-all capitalize ${
                    quality === q ? 'bg-accent/15 border border-accent/40 text-accent font-medium' : 'bg-surface-2 border border-border text-text-muted hover:border-border-strong'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setIncludeNotes(!includeNotes)}
                className={`w-9 h-5 rounded-full border transition-colors ${includeNotes ? 'bg-accent border-accent' : 'bg-surface-2 border-border'} relative`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${includeNotes ? 'left-4' : 'left-0.5'}`} />
              </div>
              <span className="text-xs text-text-muted">Include speaker notes</span>
            </label>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-text-muted">Loading exports…</p>
        ) : display.length === 0 ? (
          <EmptyState compact title="No exports yet" description="Choose a format above to create your first export." />
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-text mb-3">Previous Exports</h2>
            <div className="space-y-2">
              {display.map((exp) => (
                <div key={exp.id} className="flex items-center gap-4 px-4 py-3 bg-surface rounded-xl border border-border">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-text-faint shrink-0">
                    {exp.format === 'pptx' || exp.format === 'pdf' ? <FileText className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text uppercase">{exp.format}</p>
                    <p className="text-xs text-text-faint flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(exp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {exp.status === 'ready' && exp.url ? (
                    <a href={exp.url} download className="flex items-center gap-2 h-8 px-3 bg-accent text-[#0C0D0F] font-semibold text-xs rounded-lg hover:bg-accent-light transition-colors shadow-amber-sm">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  ) : exp.status === 'pending' ? (
                    <span className="flex items-center gap-1.5 text-xs text-warning">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating…
                    </span>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
