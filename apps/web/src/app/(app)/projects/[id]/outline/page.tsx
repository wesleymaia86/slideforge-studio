'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AlignLeft, Sparkles, Plus, GripVertical, ChevronRight, Loader2, Check } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useOutline, useGenerateOutline, useSlides } from '@/lib/api/hooks'
import { Button, EmptyState } from '@slideforge/ui'
import type { OutlineSection } from '@/lib/api/types'

function SectionCard({ section, index, slides }: { section: OutlineSection; index: number; slides: { id: string; title?: string; bgColor?: string }[] }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left"
      >
        <GripVertical className="w-4 h-4 text-text-faint shrink-0 cursor-grab" />
        <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-accent">{index + 1}</span>
        </div>
        <span className="flex-1 font-medium text-sm text-text">{section.title}</span>
        <span className="text-xs text-text-faint">{section.slides.length} slide{section.slides.length !== 1 ? 's' : ''}</span>
        <ChevronRight className={`w-4 h-4 text-text-faint transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-border/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
            {section.slides.map((slideId, i) => {
              const slide = slides.find((s) => s.id === slideId)
              return (
                <div
                  key={slideId}
                  className="relative rounded-lg overflow-hidden border border-border"
                  style={{ aspectRatio: '16/9', background: slide?.bgColor ?? 'hsl(220 15% 10%)' }}
                >
                  {slide?.title && (
                    <div className="absolute inset-0 p-1.5">
                      <span className="text-[6px] font-semibold text-white/80 leading-tight line-clamp-2">{slide.title}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 h-3 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-end pr-1 pb-0.5">
                    <span className="text-[5px] text-white/40 tabular-nums">{i + 1}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OutlinePage() {
  const { id } = useParams<{ id: string }>()
  const { data: outline, isLoading } = useOutline(id)
  const { data: slides } = useSlides(id)
  const generate = useGenerateOutline(id)
  const display = outline ?? { projectId: id, sections: [] }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              leftIcon={generate.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            >
              {generate.isPending ? 'Generating…' : 'AI Generate'}
            </Button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <AlignLeft className="w-5 h-5 text-accent" />
            <h1 className="font-display text-2xl text-text">Narrative Outline</h1>
          </div>
          <p className="text-text-muted text-sm">Structure your story arc. Drag sections to reorder.</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-text-muted">Loading outline…</p>
        ) : display.sections.length === 0 ? (
          <EmptyState
            icon={<AlignLeft className="w-7 h-7" />}
            title="No outline yet"
            description="Save a briefing first, then generate an AI outline."
            action={
              <Button variant="primary" onClick={() => generate.mutate()} loading={generate.isPending} leftIcon={<Sparkles className="w-4 h-4" />}>
                Generate Outline
              </Button>
            }
          />
        ) : (
          <div className="max-w-2xl space-y-3">
            {display.sections
              .sort((a, b) => a.order - b.order)
              .map((section, i) => (
                <SectionCard key={section.id} section={section} index={i} slides={slides ?? []} />
              ))}
            <button className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-border rounded-xl text-sm text-text-muted hover:text-text hover:border-border-strong transition-colors">
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
