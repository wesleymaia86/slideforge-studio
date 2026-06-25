'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight, Edit3, Type, Image, LayoutGrid, Save, Maximize2 } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useSlides } from '@/lib/api/hooks'
import { SlideFilmstrip, SlideCanvas, EmptyState, Button } from '@slideforge/ui'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const { data: slides, isLoading } = useSlides(id)
  const display = slides ?? []
  const [activeIdx, setActiveIdx] = useState(0)

  const active = display[activeIdx]

  const filmstripSlides = display.map((s) => ({
    id: s.id,
    title: s.title,
    content: s.content,
    bgColor: s.bgColor,
    thumbnailUrl: s.thumbnailUrl,
    index: s.index,
  }))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>Save</Button>
            <Button variant="primary" size="sm">Publish</Button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[180px] border-r border-border bg-surface flex flex-col shrink-0 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
            <span className="text-xs font-semibold text-text-muted">Slides</span>
            <span className="text-[10px] text-text-faint">{display.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1.5 scrollbar-thin">
            {isLoading ? (
              <p className="text-xs text-text-faint p-2">Loading…</p>
            ) : display.length === 0 ? (
              <p className="text-xs text-text-faint p-2">No slides</p>
            ) : (
              display.map((slide, i) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveIdx(i)}
                  className={`w-full group relative rounded-lg overflow-hidden border transition-all ${
                    i === activeIdx ? 'border-accent shadow-[0_0_0_2px_rgba(232,156,47,0.2)]' : 'border-border hover:border-border-strong'
                  }`}
                  style={{ aspectRatio: '16/9' }}
                >
                  <div className="w-full h-full p-1.5" style={{ background: slide.bgColor ?? 'hsl(220 15% 10%)' }}>
                    {slide.title && (
                      <span className="text-[6px] font-semibold text-white/80 leading-tight line-clamp-2 text-left block">
                        {slide.title}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 flex items-end justify-between px-1 pb-0.5">
                    <span className="text-[5px] text-white/30">{i + 1}</span>
                  </div>
                </button>
              ))
            )}
            <button className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-border rounded-lg text-[10px] text-text-faint hover:text-text-muted hover:border-border-strong transition-colors">
              <Plus className="w-3 h-3" />
              Add Slide
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-bg">
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-surface shrink-0">
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              <Type className="w-3.5 h-3.5" /> Text
            </button>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              <Image className="w-3.5 h-3.5" /> Image
            </button>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              <LayoutGrid className="w-3.5 h-3.5" /> Layout
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <button onClick={() => setActiveIdx((i) => Math.max(0, i - 1))} disabled={activeIdx === 0} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-text-faint tabular-nums px-1">{display.length ? activeIdx + 1 : 0} / {display.length}</span>
              <button onClick={() => setActiveIdx((i) => Math.min(display.length - 1, i + 1))} disabled={activeIdx >= display.length - 1} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors ml-1">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            {!isLoading && display.length === 0 ? (
              <EmptyState
                compact
                icon={<Edit3 className="w-8 h-8" />}
                title="No slides yet"
                description="Generate an outline or add slides to start editing."
              />
            ) : (
              <SlideCanvas
                slide={active ? { ...active, index: active.index } : undefined}
                className="w-full max-w-[840px]"
              />
            )}
          </div>

          {display.length > 0 && (
            <SlideFilmstrip slides={filmstripSlides} activeIndex={activeIdx} onSelect={setActiveIdx} />
          )}
        </div>

        {active && (
          <div className="w-[200px] border-l border-border bg-surface flex flex-col shrink-0 overflow-hidden">
            <div className="px-3 py-2 border-b border-border shrink-0">
              <span className="text-xs font-semibold text-text-muted">Properties</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Title</label>
                <textarea defaultValue={active.title ?? ''} rows={2} className="w-full bg-surface-2 border border-border rounded-lg px-2.5 py-2 text-xs text-text focus:outline-none focus:border-accent/50 resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Content</label>
                <textarea defaultValue={active.content ?? ''} rows={4} className="w-full bg-surface-2 border border-border rounded-lg px-2.5 py-2 text-xs text-text focus:outline-none focus:border-accent/50 resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Speaker Notes</label>
                <textarea defaultValue={active.speakerNotes ?? ''} rows={3} placeholder="Notes for the presenter…" className="w-full bg-surface-2 border border-border rounded-lg px-2.5 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 resize-none" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
