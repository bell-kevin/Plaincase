import { useEffect, useState, type FormEvent } from 'react'
import { db, touchCase } from '../lib/db'
import { getPlaybook } from '../lib/playbooks'
import { formatDate, hashBlob, makeId } from '../lib/utils'
import type { CaseRecord, EventKind } from '../types'
import { Modal } from './Modal'

interface BaseProps {
  caseRecord: CaseRecord
  open: boolean
  onClose: () => void
  onSaved: (message: string) => void
}

export function EditCaseModal({ caseRecord, open, onClose, onSaved }: BaseProps) {
  const [title, setTitle] = useState(caseRecord.title)
  const [summary, setSummary] = useState(caseRecord.summary)
  const [goal, setGoal] = useState(caseRecord.goal)
  const [counterparty, setCounterparty] = useState(caseRecord.counterparty)
  const [reference, setReference] = useState(caseRecord.reference ?? '')
  const [targetDate, setTargetDate] = useState(caseRecord.targetDate?.slice(0, 10) ?? '')
  const [amount, setAmount] = useState(caseRecord.amount?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(caseRecord.title)
    setSummary(caseRecord.summary)
    setGoal(caseRecord.goal)
    setCounterparty(caseRecord.counterparty)
    setReference(caseRecord.reference ?? '')
    setTargetDate(caseRecord.targetDate?.slice(0, 10) ?? '')
    setAmount(caseRecord.amount?.toString() ?? '')
  }, [open, caseRecord])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await db.cases.update(caseRecord.id, {
        title: title.trim(),
        summary: summary.trim(),
        goal: goal.trim(),
        counterparty: counterparty.trim(),
        reference: reference.trim() || undefined,
        targetDate: targetDate || undefined,
        amount: amount ? Number(amount) : undefined,
        updatedAt: new Date().toISOString(),
      })
      onSaved('Case details updated.')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit the case" eyebrow={caseRecord.title} wide>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="field field--wide">
            <span>Case title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              required
              autoFocus
            />
          </label>
          <label className="field">
            <span>Other person or organization</span>
            <input
              value={counterparty}
              onChange={(event) => setCounterparty(event.target.value)}
              maxLength={160}
            />
          </label>
          <label className="field">
            <span>Reference</span>
            <input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              maxLength={120}
            />
          </label>
          <label className="field field--wide">
            <span>What happened?</span>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              maxLength={4000}
              rows={3}
            />
          </label>
          <label className="field field--wide">
            <span>Desired resolution</span>
            <textarea
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              maxLength={2000}
              rows={3}
            />
          </label>
          <label className="field">
            <span>Target date</span>
            <input
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Amount involved in USD</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
        </div>
        <div className="modal__actions">
          <button className="button button--ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button button--ink" disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function AddEventModal({ caseRecord, open, onClose, onSaved }: BaseProps) {
  const [kind, setKind] = useState<EventKind>('message')
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [actor, setActor] = useState('Me')
  const [channel, setChannel] = useState('')
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    setKind('message')
    setTitle('')
    setDetail('')
    setActor('Me')
    setChannel('')
    setDate(now.toISOString().slice(0, 16))
  }, [open])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !date) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      await db.events.add({
        id: makeId('event'),
        caseId: caseRecord.id,
        kind,
        title: title.trim(),
        detail: detail.trim(),
        actor: actor.trim() || 'Unknown',
        channel: channel.trim() || undefined,
        occurredAt: new Date(date).toISOString(),
        createdAt: now,
      })
      await touchCase(caseRecord.id)
      onSaved('Timeline event added.')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add to the timeline" eyebrow={caseRecord.title}>
      <form onSubmit={submit}>
        <div className="form-grid form-grid--single">
          <label className="field">
            <span>What kind of event?</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as EventKind)}>
              <option value="message">Written message</option>
              <option value="call">Call</option>
              <option value="meeting">Meeting or visit</option>
              <option value="incident">Incident or observation</option>
              <option value="payment">Payment or charge</option>
              <option value="deadline">Deadline</option>
              <option value="note">Note</option>
            </select>
          </label>
          <label className="field">
            <span>Short factual heading</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What happened?"
              maxLength={200}
              required
              autoFocus
            />
          </label>
          <label className="field">
            <span>Date and time</span>
            <input
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>
          <div className="form-grid form-grid--nested">
            <label className="field">
              <span>Who?</span>
              <input
                value={actor}
                onChange={(event) => setActor(event.target.value)}
                maxLength={160}
              />
            </label>
            <label className="field">
              <span>Channel</span>
              <input
                value={channel}
                onChange={(event) => setChannel(event.target.value)}
                placeholder="Email, phone, in person…"
                maxLength={120}
              />
            </label>
          </div>
          <label className="field">
            <span>Details</span>
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="Record direct observations, exact statements, and reference numbers."
              maxLength={10_000}
              rows={4}
            />
          </label>
        </div>
        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button button--ink" disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : 'Add event'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function AddEvidenceModal({ caseRecord, open, onClose, onSaved }: BaseProps) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [occurredAt, setOccurredAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const playbook = getPlaybook(caseRecord.playbookId)

  useEffect(() => {
    if (!open) return
    setFile(null)
    setCategory(playbook.evidenceNeeds[0]?.id ?? 'other')
    setNote('')
    setOccurredAt('')
    setError('')
  }, [open, playbook])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      setError('This browser-first release accepts files up to 50 MB each.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const hash = await hashBlob(file)
      await db.evidence.add({
        id: makeId('evidence'),
        caseId: caseRecord.id,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        category,
        hash,
        addedAt: new Date().toISOString(),
        occurredAt: occurredAt || undefined,
        note: note.trim() || undefined,
        blob: file,
      })
      await touchCase(caseRecord.id)
      onSaved('File fingerprinted and stored on this device.')
      onClose()
    } catch (caught) {
      console.error(caught)
      setError('This file could not be stored. Check the browser storage allowance.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add evidence" eyebrow={caseRecord.title}>
      <form onSubmit={submit}>
        <div className="local-note">
          Plaincase computes a SHA-256 fingerprint in your browser. The file is not uploaded.
        </div>
        <div className="form-grid form-grid--single">
          <label className="file-drop">
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
            <span>{file ? file.name : 'Choose a photo, PDF, message, receipt, or other file'}</span>
            <small>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Up to 50 MB'}</small>
          </label>
          <label className="field">
            <span>What does this support?</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {playbook.evidenceNeeds.map((need) => (
                <option key={need.id} value={need.id}>
                  {need.label}
                </option>
              ))}
              <option value="other">Other context</option>
            </select>
          </label>
          <label className="field">
            <span>Date of the file or event (optional)</span>
            <input
              type="date"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Why it matters (optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Describe relevance without changing the original file."
              maxLength={2000}
              rows={3}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
        </div>
        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button button--ink" disabled={!file || saving}>
            {saving ? 'Fingerprinting…' : 'Store on this device'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function AddCommitmentModal({ caseRecord, open, onClose, onSaved }: BaseProps) {
  const [maker, setMaker] = useState(caseRecord.counterparty)
  const [detail, setDetail] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [sourceEventId, setSourceEventId] = useState('')
  const [sourceEvidenceId, setSourceEvidenceId] = useState('')
  const [sourceExcerpt, setSourceExcerpt] = useState('')
  const [saving, setSaving] = useState(false)
  const [sourceOptions, setSourceOptions] = useState<{
    events: Array<{ id: string; title: string; occurredAt: string }>
    evidence: Array<{ id: string; name: string }>
  }>({ events: [], evidence: [] })

  useEffect(() => {
    if (!open) return
    setMaker(caseRecord.counterparty)
    setDetail('')
    setDueAt('')
    setSourceEventId('')
    setSourceEvidenceId('')
    setSourceExcerpt('')
    Promise.all([
      db.events.where('caseId').equals(caseRecord.id).sortBy('occurredAt'),
      db.evidence.where('caseId').equals(caseRecord.id).toArray(),
    ]).then(([events, evidence]) => {
      const latestFirst = [...events].reverse()
      setSourceOptions({
        events: latestFirst.map(({ id, title, occurredAt }) => ({ id, title, occurredAt })),
        evidence: evidence.map(({ id, name }) => ({ id, name })),
      })
      setSourceEventId(latestFirst[0]?.id ?? '')
    })
  }, [open, caseRecord.counterparty, caseRecord.id])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!maker.trim() || !detail.trim() || !dueAt || !sourceEventId) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const commitmentId = makeId('promise')
      const due = dueAt
      await db.transaction('rw', [db.commitments, db.events, db.cases], async () => {
        await db.commitments.add({
          id: commitmentId,
          caseId: caseRecord.id,
          maker: maker.trim(),
          detail: detail.trim(),
          dueAt: due,
          status: 'open',
          sourceEventId,
          sourceEvidenceId: sourceEvidenceId || undefined,
          sourceExcerpt: sourceExcerpt.trim() || undefined,
          history: [
            {
              id: makeId('history'),
              status: 'open',
              at: now,
              note: 'Commitment captured in the promise ledger.',
            },
          ],
          createdAt: now,
        })
        await db.events.add({
          id: makeId('event'),
          caseId: caseRecord.id,
          kind: 'deadline',
          title: `Promise captured from ${maker.trim()}`,
          detail: `${detail.trim()}\n\nDue ${formatDate(due)}.`,
          actor: 'Me',
          channel: 'Promise ledger',
          commitmentId,
          occurredAt: now,
          createdAt: now,
        })
        await db.cases.update(caseRecord.id, { updatedAt: now })
      })
      onSaved('Promise added to the ledger.')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Record a promise" eyebrow={caseRecord.title}>
      <form onSubmit={submit}>
        <div className="form-grid form-grid--single">
          <label className="field">
            <span>Who made the commitment?</span>
            <input
              value={maker}
              onChange={(event) => setMaker(event.target.value)}
              maxLength={160}
              required
            />
          </label>
          <label className="field">
            <span>What exactly did they say would happen?</span>
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="Keep it concrete and quote directly when possible."
              maxLength={4000}
              rows={4}
              required
            />
          </label>
          <label className="field">
            <span>Due date</span>
            <input
              type="date"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Source timeline event</span>
            <select
              value={sourceEventId}
              onChange={(event) => setSourceEventId(event.target.value)}
              required
            >
              <option value="">Choose the event where this was said…</option>
              {sourceOptions.events.map((item) => (
                <option key={item.id} value={item.id}>
                  {new Date(item.occurredAt).toLocaleDateString()} · {item.title}
                </option>
              ))}
            </select>
            {sourceOptions.events.length === 0 && (
              <small>Add a timeline event before recording its promise.</small>
            )}
          </label>
          <label className="field">
            <span>Supporting file (optional)</span>
            <select
              value={sourceEvidenceId}
              onChange={(event) => setSourceEvidenceId(event.target.value)}
            >
              <option value="">No supporting file</option>
              {sourceOptions.evidence.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Exact words or source excerpt (recommended)</span>
            <textarea
              value={sourceExcerpt}
              onChange={(event) => setSourceExcerpt(event.target.value)}
              placeholder="Paste the shortest exact excerpt that contains the commitment."
              maxLength={4000}
              rows={3}
            />
          </label>
        </div>
        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button button--ink" disabled={saving || !sourceEventId}>
            {saving ? 'Saving…' : 'Add promise'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function AddTaskModal({ caseRecord, open, onClose, onSaved }: BaseProps) {
  const [title, setTitle] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle('')
    setDueAt('')
  }, [open])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await db.tasks.add({
        id: makeId('task'),
        caseId: caseRecord.id,
        title: title.trim(),
        dueAt: dueAt || undefined,
        status: 'open',
        createdAt: new Date().toISOString(),
      })
      await touchCase(caseRecord.id)
      onSaved('Next step added.')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Choose the next move" eyebrow={caseRecord.title}>
      <form onSubmit={submit}>
        <div className="form-grid form-grid--single">
          <label className="field">
            <span>One concrete action</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Send a written recap of today's call"
              maxLength={300}
              required
              autoFocus
            />
          </label>
          <label className="field">
            <span>Due date (optional)</span>
            <input
              type="date"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </label>
        </div>
        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button button--ink" disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : 'Add next step'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
