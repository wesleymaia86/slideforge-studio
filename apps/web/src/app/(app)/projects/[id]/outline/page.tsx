'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AlignLeft, Sparkles, Plus, GripVertical, ChevronRight, Loader2, Check } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useOutline, useGenerateOutline } from '@/lib/api/hooks'
import { mockOutline, mockSlides } from '@/lib/mocks'
import type { OutlineSection } from '@/lib/api/types'

function SectionCard({ section, index }: { section: OutlineSection; index: number }) {
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
              const slide = mockSlides.find((s) => s.id === slideId)
              return (
                <div
                  key={slideId}
                  className="relative rounded-lg overflow-hidden border border-border"
                  style={{ aspectRatio: '16/9', background: slide?.bgColor ?? 'hsl(220 15% 10%)' }}
                >
                  <div className="absolute inset-0 p-1.5 flex flex-col gap-1">
                    {slide?.title && (
                      <span className="text-[6px] font-semibold text-white/80 leading-tight line-clamp-2">{slide.title}</span>
                    )}
                  </div>
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
  const { data: outline } = useOutline(id)
  const generate = useGenerateOutline(id)
  const [saved, setSaved] = useState(false)
  const display = outline ?? mockOutline

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
              className={`flex items-center gap-2 h-8 px-3 text-xs font-semibold rounded-lg transition-all ${
                saved
                  ? 'bg-success/15 text-success border border-success/25'
                  : 'bg-surface-2 text-text-muted border border-border hover:text-text hover:bg-surface-3'
              }`}
            >
              {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save'}
            </button>
            <button
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              className="flex items-center gap-2 h-8 px-3 bg-accent text-[#0C0D0F] text-xs font-semibold rounded-lg hover:bg-accent-light transition-colors shadow-amber-sm disabled:opacity-60"
            >
              {generate.isPending ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> AI Generate</>
              )}
            </button>
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

        {display.sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-text-faint mb-4">
              <AlignLeft className="w-7 h-7" />
            </div>
            <p className="font-medium text-text mb-1">No outline yet</p>
            <p className="text-sm text-text-muted max-w-sm mb-5">
              Generate an AI outline from your briefing, or add sections manually.
            </p>
            <button
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              className="flex items-center gap-2 h-9 px-4 bg-accent text-[#0C0D0F] font-semibold text-sm rounded-[10px] hover:bg-accent-light transition-colors shadow-amber"
            >
              <Sparkles className="w-4 h-4" />
              Generate Outline
            </button>
          </div>
        ) : (
          <div className="max-w-2xl space-y-3">
            {display.sections
              .sort((a, b) => a.order - b.order)
              .map((section, i) => (
                <SectionCard key={section.id} section={section} index={i} />
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
