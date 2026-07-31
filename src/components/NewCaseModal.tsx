import {
  FileQuestion,
  Hammer,
  HeartPulse,
  Home,
  ShoppingBag,
  Umbrella,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { createCase } from '../lib/db'
import { getPlaybook, playbooks } from '../lib/playbooks'
import { Modal } from './Modal'

interface NewCaseModalProps {
  open: boolean
  initialPlaybookId?: string
  onClose: () => void
  onCreated: (caseId: string) => void
}

const icons = {
  'home-repair': Home,
  'purchase-problem': ShoppingBag,
  'insurance-claim': Umbrella,
  'contractor-work': Hammer,
  'medical-bill': HeartPulse,
  other: FileQuestion,
}

export function NewCaseModal({
  open,
  initialPlaybookId = 'home-repair',
  onClose,
  onCreated,
}: NewCaseModalProps) {
  const [step, setStep] = useState(1)
  const [playbookId, setPlaybookId] = useState('home-repair')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [goal, setGoal] = useState('')
  const [counterparty, setCounterparty] = useState('')
  const [reference, setReference] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const playbook = getPlaybook(playbookId)

  useEffect(() => {
    if (!open) return
    setStep(1)
    setPlaybookId(initialPlaybookId)
    setTitle('')
    setSummary('')
    setGoal('')
    setCounterparty('')
    setReference('')
    setTargetDate('')
    setAmount('')
    setSaving(false)
  }, [open, initialPlaybookId])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const caseId = await createCase({
        title: title.trim(),
        playbookId,
        summary: summary.trim(),
        goal: goal.trim(),
        counterparty: counterparty.trim(),
        reference: reference.trim() || undefined,
        targetDate: targetDate || undefined,
        amount: amount ? Number(amount) : undefined,
        accent: playbook.color,
      })
      onCreated(caseId)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === 1 ? 'What kind of story is this?' : 'Start with the plain facts'}
      eyebrow={`New case · ${step} of 2`}
      wide
    >
      {step === 1 ? (
        <>
          <p className="modal__intro">
            A playbook changes the evidence prompts and workflow—not your options or rights.
          </p>
          <div className="playbook-picker">
            {playbooks.map((item) => {
              const Icon = icons[item.id as keyof typeof icons] ?? FileQuestion
              return (
                <button
                  key={item.id}
                  type="button"
                  className={playbookId === item.id ? 'playbook-choice--active' : ''}
                  onClick={() => setPlaybookId(item.id)}
                  aria-pressed={playbookId === item.id}
                  style={{ '--choice-color': item.color } as React.CSSProperties}
                >
                  <span>
                    <Icon size={21} />
                  </span>
                  <strong>{item.shortTitle}</strong>
                  <small>{item.description}</small>
                </button>
              )
            })}
          </div>
          <div className="modal__actions">
            <button className="button button--ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="button button--ink" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field field--wide">
              <span>Case title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Washer repair that keeps stalling"
                maxLength={160}
                autoFocus
                required
              />
              <small>Use a title you will recognize at a glance.</small>
            </label>
            <label className="field">
              <span>Other person or organization</span>
              <input
                value={counterparty}
                onChange={(event) => setCounterparty(event.target.value)}
                placeholder="Who is on the other side?"
                maxLength={160}
              />
            </label>
            <label className="field">
              <span>Reference</span>
              <input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Order, ticket, claim…"
                maxLength={120}
              />
            </label>
            <label className="field field--wide">
              <span>What happened?</span>
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="A short, factual description. You can add the chronology next."
                maxLength={4000}
                rows={3}
              />
            </label>
            <label className="field field--wide">
              <span>{playbook.goalPrompt}</span>
              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Name one concrete outcome."
                maxLength={2000}
                rows={2}
              />
            </label>
            <label className="field">
              <span>Your target date</span>
              <input
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Amount involved in USD (optional)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
            </label>
          </div>
          <div className="modal__actions">
            <button className="button button--ghost" type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="button button--ink" type="submit" disabled={saving || !title.trim()}>
              {saving ? 'Creating…' : 'Create private case'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
