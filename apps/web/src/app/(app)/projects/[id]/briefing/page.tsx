'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { FileText, ChevronRight, ChevronLeft, Check, Plus, X } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useBriefing, useSaveBriefing } from '@/lib/api/hooks'
import { Button } from '@slideforge/ui'
import { t } from '@/lib/i18n'
import type { BriefingData } from '@/lib/api/types'

const STEPS = [
  { id: 'audience', label: t('briefing.audience'), description: t('briefing.audienceDesc') },
  { id: 'objective', label: t('briefing.objective'), description: t('briefing.objectiveDesc') },
  { id: 'tone', label: t('briefing.tone'), description: t('briefing.toneDesc') },
  { id: 'messages', label: t('briefing.messages'), description: t('briefing.messagesDesc') },
  { id: 'context', label: t('briefing.context'), description: t('briefing.contextDesc') },
]

const TONE_OPTIONS = [
  t('briefing.tones.professional'),
  t('briefing.tones.inspiring'),
  t('briefing.tones.dataDriven'),
  t('briefing.tones.conversational'),
  t('briefing.tones.authoritative'),
  t('briefing.tones.innovative'),
  t('briefing.tones.empathetic'),
  t('briefing.tones.bold'),
]

export default function BriefingPage() {
  const { id } = (useParams<{ id: string }>() ?? { id: '' })
  const { data: briefing, isLoading } = useBriefing(id)
  const save = useSaveBriefing(id)
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<BriefingData>({
    projectId: id,
    audience: '',
    objective: '',
    tone: '',
    duration: 20,
    keyMessages: [],
    context: '',
  })
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (briefing) setForm({ ...briefing, projectId: id })
  }, [briefing, id])

  const handleSave = async () => {
    await save.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addMessage = () => {
    if (!newMessage.trim()) return
    setForm((f) => ({ ...f, keyMessages: [...(f.keyMessages ?? []), newMessage.trim()] }))
    setNewMessage('')
  }

  const removeMessage = (i: number) => {
    setForm((f) => ({ ...f, keyMessages: f.keyMessages?.filter((_, idx) => idx !== i) }))
  }

  const isLast = step === STEPS.length - 1
  const isFirst = step === 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        actions={
          <Button
            variant={saved ? 'outline' : 'primary'}
            size="sm"
            onClick={handleSave}
            loading={save.isPending}
            leftIcon={saved ? <Check className="w-3.5 h-3.5" /> : undefined}
          >
            {saved ? t('common.saved') : save.isPending ? t('common.saving') : t('briefing.saveBriefing')}
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-2">
              <FileText className="w-5 h-5 text-accent" />
              <h1 className="font-display text-2xl text-text">{t('briefing.title')}</h1>
            </div>
            <p className="text-text-muted text-sm">Ajude a IA a entender o propósito e contexto da sua apresentação.</p>
          </div>

          {isLoading ? (
            <p className="text-sm text-text-muted">Carregando briefing…</p>
          ) : (
            <>
              <div className="flex items-center gap-1 mb-8">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-1 flex-1 min-w-0">
                    <button
                      onClick={() => setStep(i)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all shrink-0 ${
                        i < step ? 'bg-accent text-[#0C0D0F]' : i === step ? 'bg-accent/20 border-2 border-accent text-accent' : 'bg-surface-2 border border-border text-text-faint'
                      }`}
                    >
                      {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px flex-1 transition-colors ${i < step ? 'bg-accent/40' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-surface rounded-2xl border border-border p-6 mb-6 min-h-[280px]">
                <div className="mb-6">
                  <h2 className="font-display text-xl text-text mb-1">{STEPS[step].label}</h2>
                  <p className="text-sm text-text-muted">{STEPS[step].description}</p>
                </div>

                {step === 0 && (
                  <textarea
                    value={form.audience ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                    rows={4}
                    placeholder={t('briefing.audiencePlaceholder')}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors resize-none"
                  />
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <textarea
                      value={form.objective ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
                      rows={3}
                      placeholder={t('briefing.objectivePlaceholder')}
                      className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors resize-none"
                    />
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-text-muted shrink-0">Duração da apresentação</label>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={form.duration ?? 20}
                        onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                        className="w-24 h-9 bg-surface-2 border border-border rounded-lg px-3 text-sm text-text focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors text-center"
                      />
                      <span className="text-xs text-text-muted">minutos</span>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setForm((f) => ({ ...f, tone: t }))}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          form.tone === t ? 'bg-accent/15 border-accent/40 text-accent font-medium' : 'bg-surface-2 border-border text-text-muted hover:border-border-strong hover:text-text'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addMessage()}
                        placeholder={t('briefing.messagePlaceholder')}
                        className="flex-1 h-9 bg-surface-2 border border-border rounded-[10px] px-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors"
                      />
                      <Button variant="primary" size="icon" onClick={addMessage} disabled={!newMessage.trim()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(form.keyMessages ?? []).map((msg, i) => (
                        <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-surface-2 rounded-lg border border-border">
                          <span className="text-accent text-xs font-semibold mt-0.5 shrink-0">{i + 1}.</span>
                          <span className="text-sm text-text flex-1 leading-relaxed">{msg}</span>
                          <button onClick={() => removeMessage(i)} className="text-text-faint hover:text-error transition-colors shrink-0 mt-0.5">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <textarea
                    value={form.context ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
                    rows={4}
                    placeholder={t('briefing.contextPlaceholder')}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors resize-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={isFirst} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                  {t('common.back')}
                </Button>
                {isLast ? (
                  <Button variant="primary" onClick={handleSave} loading={save.isPending} leftIcon={<Check className="w-4 h-4" />}>
                    {t('briefing.saveBriefing')}
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => setStep((s) => s + 1)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Próximo
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
