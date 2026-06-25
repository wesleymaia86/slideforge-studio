'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight, Edit3, Type, Image, LayoutGrid, Save, Maximize2 } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useSlides } from '@/lib/api/hooks'
import { mockSlides } from '@/lib/mocks'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const { data: slides } = useSlides(id)
  const display = slides ?? mockSlides
  const [activeIdx, setActiveIdx] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const active = display[activeIdx]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 h-8 px-3 border border-border rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
            <button className="flex items-center gap-2 h-8 px-3 bg-accent text-[#0C0D0F] text-xs font-semibold rounded-lg hover:bg-accent-light transition-colors shadow-amber-sm">
              Publish
            </button>
          </div>
        }
      />

      {/* Editor layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide list panel */}
        <div className="w-[180px] border-r border-border bg-surface flex flex-col shrink-0 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
            <span className="text-xs font-semibold text-text-muted">Slides</span>
            <span className="text-[10px] text-text-faint">{display.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1.5 scrollbar-thin">
            {display.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setActiveIdx(i)}
                className={`w-full group relative rounded-lg overflow-hidden border transition-all ${
                  i === activeIdx
                    ? 'border-accent shadow-[0_0_0_2px_rgba(232,156,47,0.2)]'
                    : 'border-border hover:border-border-strong'
                }`}
                style={{ aspectRatio: '16/9' }}
              >
                <div
                  className="w-full h-full flex flex-col items-start justify-start p-1.5 gap-1"
                  style={{ background: slide.bgColor ?? 'hsl(220 15% 10%)' }}
                >
                  {slide.title && (
                    <span className="text-[6px] font-semibold text-white/80 leading-tight line-clamp-2 text-left">
                      {slide.title}
                    </span>
                  )}
                  <div className="flex flex-col gap-0.5 w-full">
                    <div className="h-px bg-white/10 w-3/4" />
                    <div className="h-px bg-white/6 w-1/2" />
                  </div>
                </div>
                {/* Grain */}
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '32px',
                  }}
                />
                <div className="absolute bottom-0 inset-x-0 flex items-end justify-between px-1 pb-0.5">
                  <span className="text-[5px] text-white/30">{i + 1}</span>
                </div>
              </button>
            ))}
            <button className="w-full flex items-center justify-center gap-1 py-2 border border-dashed border-border rounded-lg text-[10px] text-text-faint hover:text-text-muted hover:border-border-strong transition-colors">
              <Plus className="w-3 h-3" />
              Add Slide
            </button>
          </div>
        </div>

        {/* Main canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-bg">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-surface shrink-0">
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              <Type className="w-3.5 h-3.5" />
              Text
            </button>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              <Image className="w-3.5 h-3.5" />
              Image
            </button>
            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              <LayoutGrid className="w-3.5 h-3.5" />
              Layout
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-text-faint tabular-nums px-1">
                {activeIdx + 1} / {display.length}
              </span>
              <button
                onClick={() => setActiveIdx((i) => Math.min(display.length - 1, i + 1))}
                disabled={activeIdx === display.length - 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors ml-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slide canvas */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            <div
              className="relative rounded-xl overflow-hidden border border-border shadow-card w-full"
              style={{ maxWidth: '840px', aspectRatio: '16/9', background: active?.bgColor ?? 'hsl(220 15% 10%)' }}
            >
              {active ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-12 gap-5">
                  {active.title && (
                    <h2 className="text-3xl font-bold text-white text-center leading-tight max-w-2xl">
                      {active.title}
                    </h2>
                  )}
                  {active.content && (
                    <p className="text-base text-white/70 text-center leading-relaxed max-w-xl">
                      {active.content}
                    </p>
                  )}
                  {!active.title && !active.content && (
                    <div className="flex flex-col items-center gap-3 text-white/30">
                      <Edit3 className="w-10 h-10" />
                      <p className="text-sm">Empty slide — click to add content</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <p className="text-sm">No slide selected</p>
                </div>
              )}

              {/* Grain overlay — the memorable anchor */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '128px 128px',
                }}
              />
            </div>
          </div>

          {/* Filmstrip — the design anchor */}
          <div className="border-t border-border bg-surface relative shrink-0">
            {/* Sprocket holes */}
            <div className="h-2 flex items-center px-3 gap-2.5 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="w-2 h-1 rounded-sm bg-border shrink-0" />
              ))}
            </div>
            {/* Filmstrip grain */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.025]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '128px',
              }}
            />
            <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-thin">
              {display.map((slide, i) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveIdx(i)}
                  className={`relative shrink-0 rounded overflow-hidden border transition-all duration-150 ${
                    i === activeIdx
                      ? 'border-accent scale-105 shadow-[0_0_0_2px_rgba(232,156,47,0.2)]'
                      : 'border-border hover:border-border-strong hover:scale-[1.02]'
                  }`}
                  style={{ width: '80px', aspectRatio: '16/9' }}
                >
                  <div
                    className="w-full h-full"
                    style={{ background: slide.bgColor ?? 'hsl(220 15% 10%)' }}
                  />
                  <div className="absolute bottom-0 inset-x-0 h-3 bg-black/50 flex items-end justify-center pb-0.5">
                    <span className="text-[5px] text-white/40 tabular-nums">{i + 1}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="h-2 flex items-center px-3 gap-2.5 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="w-2 h-1 rounded-sm bg-border shrink-0" />
              ))}
            </div>
          </div>
        </div>

        {/* Right properties panel */}
        {active && (
          <div className="w-[200px] border-l border-border bg-surface flex flex-col shrink-0 overflow-hidden">
            <div className="px-3 py-2 border-b border-border shrink-0">
              <span className="text-xs font-semibold text-text-muted">Properties</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Title</label>
                <textarea
                  defaultValue={active.title ?? ''}
                  rows={2}
                  className="w-full bg-surface-2 border border-border rounded-lg px-2.5 py-2 text-xs text-text focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 resize-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Content</label>
                <textarea
                  defaultValue={active.content ?? ''}
                  rows={4}
                  className="w-full bg-surface-2 border border-border rounded-lg px-2.5 py-2 text-xs text-text focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 resize-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">Speaker Notes</label>
                <textarea
                  defaultValue={active.speakerNotes ?? ''}
                  rows={3}
                  placeholder="Notes for the presenter…"
                  className="w-full bg-surface-2 border border-border rounded-lg px-2.5 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 resize-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
