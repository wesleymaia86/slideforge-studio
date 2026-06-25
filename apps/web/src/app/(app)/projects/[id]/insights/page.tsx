'use client'

import { useParams } from 'next/navigation'
import { BarChart3, Lightbulb, Tag, MessageSquare, TrendingUp, Sparkles } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useInsights } from '@/lib/api/hooks'
import { EmptyState, Progress } from '@slideforge/ui'
import type { Insight } from '@/lib/api/types'

const typeConfig: Record<Insight['type'], { label: string; icon: React.ReactNode; gradient: string }> = {
  summary: { label: 'Summary', icon: <BarChart3 className="w-4 h-4" />, gradient: 'from-accent/20 to-accent/5' },
  keyword: { label: 'Keywords', icon: <Tag className="w-4 h-4" />, gradient: 'from-info/20 to-info/5' },
  sentiment: { label: 'Sentiment', icon: <MessageSquare className="w-4 h-4" />, gradient: 'from-success/20 to-success/5' },
  topic: { label: 'Topics', icon: <Lightbulb className="w-4 h-4" />, gradient: 'from-warning/20 to-warning/5' },
  recommendation: { label: 'Recommendation', icon: <TrendingUp className="w-4 h-4" />, gradient: 'from-error/20 to-error/5' },
}

const typeColor: Record<Insight['type'], string> = {
  summary: 'text-accent',
  keyword: 'text-info',
  sentiment: 'text-success',
  topic: 'text-warning',
  recommendation: 'text-error',
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} size="sm" className="w-20" variant="accent" />
      <span className="text-[10px] text-text-faint tabular-nums">{pct}%</span>
    </div>
  )
}

export default function InsightsPage() {
  const { id } = (useParams<{ id: string }>() ?? { id: '' })
  const { data: insights, isLoading } = useInsights(id)
  const display = insights ?? []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h1 className="font-display text-2xl text-text">AI Insights</h1>
          </div>
          <p className="text-text-muted text-sm">Machine-generated analysis of your presentation content.</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-text-muted">Loading insights…</p>
        ) : display.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="w-7 h-7" />}
            title="No insights yet"
            description="Upload and process content to generate AI insights."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {display.map((insight) => {
              const config = typeConfig[insight.type]
              const color = typeColor[insight.type]
              return (
                <div
                  key={insight.id}
                  className={`bg-gradient-to-br ${config.gradient} border border-border rounded-xl p-5 relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`flex items-center gap-2 ${color}`}>
                      {config.icon}
                      <span className="text-xs font-semibold uppercase tracking-wide">{config.label}</span>
                    </div>
                    <ConfidenceBar value={insight.confidence} />
                  </div>
                  <p className="text-sm text-text leading-relaxed">{insight.content}</p>
                  <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 bg-current ${color}`} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
