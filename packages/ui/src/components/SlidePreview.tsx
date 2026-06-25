'use client'

import * as React from 'react'
import { cn } from '../lib/utils'

interface Slide {
  id: string
  title?: string
  content?: string
  bgColor?: string
  thumbnailUrl?: string
  index: number
}

interface SlidePreviewProps {
  slides: Slide[]
  activeIndex?: number
  onSelect?: (index: number) => void
  className?: string
}

interface SlideThumbProps {
  slide: Slide
  isActive: boolean
  onClick?: () => void
}

function SlideThumb({ slide, isActive, onClick }: SlideThumbProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative shrink-0 w-24 rounded-md overflow-hidden border transition-all duration-150 group',
        isActive
          ? 'border-accent shadow-[0_0_0_2px_rgba(232,156,47,0.25)] scale-105'
          : 'border-border hover:border-border-strong hover:scale-[1.02]',
      )}
      style={{ aspectRatio: '16/9' }}
    >
      {slide.thumbnailUrl ? (
        <img src={slide.thumbnailUrl} alt={slide.title ?? `Slide ${slide.index + 1}`} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center p-2 gap-1"
          style={{ background: slide.bgColor ?? 'hsl(220 15% 12%)' }}
        >
          {slide.title && (
            <span className="text-[6px] font-semibold text-white/90 text-center leading-tight line-clamp-2">
              {slide.title}
            </span>
          )}
          {slide.content && (
            <span className="text-[5px] text-white/50 text-center leading-tight line-clamp-2">
              {slide.content}
            </span>
          )}
        </div>
      )}
      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '64px 64px',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-0.5">
        <span className="text-[5px] text-white/50 tabular-nums">{slide.index + 1}</span>
      </div>
    </button>
  )
}

export function SlideFilmstrip({ slides, activeIndex = 0, onSelect, className }: SlidePreviewProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      const active = scrollRef.current.children[activeIndex] as HTMLElement
      active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeIndex])

  return (
    <div
      className={cn(
        'relative bg-surface border-t border-border',
        className,
      )}
    >
      {/* Grain overlay on filmstrip */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
      {/* Sprocket holes — filmstrip aesthetic */}
      <div className="absolute top-0 left-0 right-0 h-2 flex items-center px-2 gap-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1 rounded-sm bg-border shrink-0" />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-2 flex items-center px-2 gap-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1 rounded-sm bg-border shrink-0" />
        ))}
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border"
      >
        {slides.map((slide, i) => (
          <SlideThumb
            key={slide.id}
            slide={slide}
            isActive={i === activeIndex}
            onClick={() => onSelect?.(i)}
          />
        ))}
        {slides.length === 0 && (
          <div className="flex items-center justify-center w-full py-4 text-xs text-text-faint">
            No slides yet
          </div>
        )}
      </div>
    </div>
  )
}

export function SlideCanvas({ slide, className }: { slide?: Slide; className?: string }) {
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden border border-border shadow-card flex items-center justify-center',
        className,
      )}
      style={{ aspectRatio: '16/9' }}
    >
      {slide ? (
        <div
          className="w-full h-full flex flex-col items-center justify-center p-8 gap-4"
          style={{ background: slide.bgColor ?? 'hsl(220 15% 10%)' }}
        >
          {slide.title && (
            <h2 className="text-2xl font-bold text-white text-center leading-tight">{slide.title}</h2>
          )}
          {slide.content && (
            <p className="text-sm text-white/70 text-center leading-relaxed">{slide.content}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-text-faint">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">No slide selected</span>
        </div>
      )}
      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  )
}
