import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  FileCheck2,
  FileText,
  Fingerprint,
  Flag,
  Info,
  ListChecks,
  Mail,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Printer,
  Receipt,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  AddCommitmentModal,
  AddEvidenceModal,
  AddEventModal,
  AddTaskModal,
  EditCaseModal,
} from '../components/CaseForms'
import { ScoreRing, StatusPill } from '../components/CaseCard'
import { db, deleteCase, touchCase } from '../lib/db'
import { downloadEvidence, exportCasePack } from '../lib/export'
import { getPlaybook } from '../lib/playbooks'
import { getCompleteness, getRadar } from '../lib/radar'
import {
  formatBytes,
  copyText,
  formatDate,
  formatDateTime,
  formatMoney,
  makeId,
  relativeDate,
  shortHash,
} from '../lib/utils'
import type {
  CaseEvent,
  CaseSnapshot,
  CaseStage,
  CaseStatus,
  EventKind,
} from '../types'

interface CaseViewProps {
  snapshot: CaseSnapshot
  onNavigate: (path: string) => void
  onToast: (message: string) => void
}

type Tab = 'overview' | 'timeline' | 'evidence' | 'promises' | 'pack'

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'overview', label: 'Case radar' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'promises', label: 'Promises' },
  { id: 'pack', label: 'Case pack' },
]

const eventIcons: Record<EventKind, typeof MessageSquareText> = {
  message: Mail,
  call: Phone,
  meeting: UsersRound,
  incident: MapPin,
  payment: Receipt,
  deadline: Calendar,
  note: FileText,
}

const stageOrder: CaseStage[] = ['capture', 'contact', 'follow-up', 'escalate', 'resolved']

function TimelineEvent({ event }: { event: CaseEvent }) {
  const Icon = eventIcons[event.kind]
  return (
    <article className="timeline-event" id={`timeline-${event.id}`}>
      <div className={`timeline-event__icon timeline-event__icon--${event.kind}`}>
        <Icon size={18} />
      </div>
      <div className="timeline-event__content">
        <div className="timeline-event__head">
          <div>
            <span>{formatDateTime(event.occurredAt)}</span>
            <h3>{event.title}</h3>
          </div>
          <span className="timeline-event__kind">{event.kind}</span>
        </div>
        <p>{event.detail || 'No additional detail recorded.'}</p>
        <footer>
          <UserRound size={14} />
          <span>{event.actor}</span>
          {event.channel && (
            <>
              <i />
              <span>{event.channel}</span>
            </>
          )}
        </footer>
      </div>
    </article>
  )
}

export function CaseView({ snapshot, onNavigate, onToast }: CaseViewProps) {
  const [tab, setTab] = useState<Tab>('overview')
  const [eventOpen, setEventOpen] = useState(false)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [commitmentOpen, setCommitmentOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const playbook = getPlaybook(snapshot.case.playbookId)
  const score = getCompleteness(snapshot)
  const radar = getRadar(snapshot)
  const capturedCategories = new Set(snapshot.evidence.map((item) => item.category))
  const sortedEvents = useMemo(
    () => [...snapshot.events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    [snapshot.events],
  )
  const openPromises = snapshot.commitments.filter((item) => item.status === 'open')

  async function setStatus(status: CaseStatus) {
    const updates: Partial<typeof snapshot.case> = {
      status,
      updatedAt: new Date().toISOString(),
    }
    if (status === 'resolved') updates.stage = 'resolved'
    if (status !== 'resolved' && snapshot.case.stage === 'resolved') updates.stage = 'follow-up'
    await db.cases.update(snapshot.case.id, updates)
    onToast(status === 'resolved' ? 'Case marked resolved.' : 'Case status updated.')
  }

  async function setStage(stage: CaseStage) {
    const updates: Partial<typeof snapshot.case> = {
      stage,
      updatedAt: new Date().toISOString(),
    }
    if (stage === 'resolved') updates.status = 'resolved'
    if (stage !== 'resolved' && snapshot.case.status === 'resolved') updates.status = 'active'
    await db.cases.update(snapshot.case.id, updates)
    onToast('Playbook stage updated.')
  }

  async function buildPack() {
    setExporting(true)
    try {
      await exportCasePack(snapshot)
      onToast('Portable case pack exported.')
    } catch (error) {
      console.error(error)
      onToast('The case pack could not be created.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="case-page">
      <div className="case-breadcrumb">
        <button onClick={() => onNavigate('/cases')}>
          <ArrowLeft size={16} />
          Cases
        </button>
        <ChevronRight size={14} />
        <span>{snapshot.case.title}</span>
      </div>

      <section className="case-hero" style={{ '--case-accent': snapshot.case.accent } as React.CSSProperties}>
        <div className="case-hero__main">
          <div className="case-hero__eyebrow">
            <StatusPill status={snapshot.case.status} />
            <span>{playbook.shortTitle}</span>
            {snapshot.case.reference && <span>{snapshot.case.reference}</span>}
          </div>
          <h1>{snapshot.case.title}</h1>
          <p>{snapshot.case.summary || 'No summary has been recorded yet.'}</p>
          <div className="case-hero__meta">
            <div>
              <UserRound size={16} />
              <span>
                Other side<strong>{snapshot.case.counterparty || 'Not recorded'}</strong>
              </span>
            </div>
            <div>
              <Target size={16} />
              <span>
                Target
                <strong>
                  {snapshot.case.targetDate
                    ? `${formatDate(snapshot.case.targetDate)} · ${relativeDate(snapshot.case.targetDate)}`
                    : 'No date'}
                </strong>
              </span>
            </div>
            <div>
              <WalletCards size={16} />
              <span>
                Amount<strong>{formatMoney(snapshot.case.amount)}</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="case-hero__coverage">
          <ScoreRing score={score} />
          <div>
            <span>Record coverage</span>
            <strong>{score >= 80 ? 'Well supported' : score >= 55 ? 'Taking shape' : 'Needs context'}</strong>
            <small>Structural completeness, not case strength</small>
          </div>
        </div>
        <div className="case-hero__actions">
          <button className="button button--lime" onClick={() => setEventOpen(true)}>
            <Plus size={17} /> Add event
          </button>
          <button className="button button--hero-ghost" onClick={() => setEvidenceOpen(true)}>
            <FileCheck2 size={17} /> Add evidence
          </button>
          <div className="overflow-menu">
            <button
              className="button button--hero-icon"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <MoreHorizontal size={19} />
              <span className="sr-only">Case actions</span>
            </button>
            {menuOpen && (
              <div className="overflow-menu__panel">
                <label>
                  <span>Status</span>
                  <select
                    value={snapshot.case.status}
                    onChange={(event) => setStatus(event.target.value as CaseStatus)}
                  >
                    <option value="active">Moving</option>
                    <option value="waiting">Waiting</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setEditOpen(true)
                  }}
                >
                  <Pencil size={15} /> Edit case details
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    window.print()
                  }}
                >
                  <Printer size={15} /> Print current view
                </button>
                <button
                  className="overflow-menu__danger"
                  onClick={async () => {
                    setMenuOpen(false)
                    if (!window.confirm(`Delete “${snapshot.case.title}” and all of its local files?`))
                      return
                    await deleteCase(snapshot.case.id)
                    onToast('Case deleted from this device.')
                    onNavigate('/cases')
                  }}
                >
                  <Trash2 size={15} /> Delete case
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <nav className="case-tabs" aria-label="Case sections" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? 'case-tabs--active' : ''}
            onClick={() => setTab(item.id)}
            role="tab"
            aria-selected={tab === item.id}
          >
            {item.label}
            {item.id === 'timeline' && <span>{snapshot.events.length}</span>}
            {item.id === 'evidence' && <span>{snapshot.evidence.length}</span>}
            {item.id === 'promises' && openPromises.length > 0 && <span>{openPromises.length}</span>}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="case-overview">
          <section className="case-column-main">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Case radar</span>
                <h2>What deserves attention</h2>
              </div>
              <span className="freshness">
                <Clock3 size={14} /> Runs locally, live
              </span>
            </div>
            <div className="radar-list">
              {radar.slice(0, 5).map((item) => (
                <article key={item.id} className={`radar-item radar-item--${item.severity}`}>
                  <span className="radar-item__status">
                    {item.severity === 'now' ? (
                      <AlertCircle size={19} />
                    ) : item.severity === 'good' ? (
                      <CheckCircle2 size={19} />
                    ) : item.severity === 'soon' ? (
                      <Clock3 size={19} />
                    ) : (
                      <Info size={19} />
                    )}
                  </span>
                  <div>
                    <span>{item.severity === 'now' ? 'Act now' : item.severity}</span>
                    <h3>{item.label}</h3>
                    <p>{item.explanation}</p>
                    <strong>{item.action}</strong>
                  </div>
                  {item.dueAt && <time>{formatDate(item.dueAt)}</time>}
                </article>
              ))}
            </div>

            <div className="section-heading section-heading--spaced">
              <div>
                <span className="eyebrow">Your next moves</span>
                <h2>Keep it concrete</h2>
              </div>
              <button className="text-button" onClick={() => setTaskOpen(true)}>
                <Plus size={16} /> Add step
              </button>
            </div>
            <div className="task-list">
              {snapshot.tasks.length ? (
                [...snapshot.tasks]
                  .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done'))
                  .map((task) => (
                    <article className={task.status === 'done' ? 'task--done' : ''} key={task.id}>
                      <button
                        onClick={async () => {
                          const done = task.status === 'done'
                          await db.tasks.update(task.id, {
                            status: done ? 'open' : 'done',
                            completedAt: done ? undefined : new Date().toISOString(),
                          })
                          await touchCase(snapshot.case.id)
                        }}
                        aria-label={task.status === 'done' ? 'Reopen task' : 'Complete task'}
                      >
                        {task.status === 'done' ? <Check size={15} /> : <Circle size={16} />}
                      </button>
                      <span>
                        <strong>{task.title}</strong>
                        <small>{task.dueAt ? `Due ${formatDate(task.dueAt)}` : 'No due date'}</small>
                      </span>
                      <button
                        className="task-list__delete"
                        onClick={() => db.tasks.delete(task.id)}
                        aria-label="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </article>
                  ))
              ) : (
                <div className="inline-empty">
                  <ListChecks size={23} />
                  <span>
                    <strong>No next move selected.</strong>
                    <small>Add one action that you control.</small>
                  </span>
                </div>
              )}
            </div>
          </section>

          <aside className="case-column-side">
            <article className="resolution-card">
              <span className="eyebrow">Desired resolution</span>
              <blockquote>{snapshot.case.goal || 'No concrete outcome recorded yet.'}</blockquote>
              <small>
                <Target size={14} /> You can revise this as the facts change.
              </small>
            </article>

            <article className="playbook-progress">
              <div>
                <span className="eyebrow">{playbook.shortTitle} playbook</span>
                <h3>Where you are</h3>
              </div>
              {playbook.steps.map((step, index) => {
                const currentIndex = stageOrder.indexOf(snapshot.case.stage)
                const stepIndex = stageOrder.indexOf(step.id as CaseStage)
                const complete = stepIndex < currentIndex || snapshot.case.stage === 'resolved'
                const current = step.id === snapshot.case.stage
                return (
                  <button
                    key={step.id}
                    className={current ? 'playbook-step--current' : complete ? 'playbook-step--done' : ''}
                    onClick={() => setStage(step.id as CaseStage)}
                    aria-current={current ? 'step' : undefined}
                    aria-pressed={current}
                  >
                    <span>{complete ? <Check size={14} /> : `0${index + 1}`}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <small>{current ? step.prompt : step.description}</small>
                    </div>
                  </button>
                )
              })}
            </article>

            <article className="evidence-coverage">
              <div>
                <span className="eyebrow">Evidence map</span>
                <button onClick={() => setEvidenceOpen(true)}>
                  <Plus size={15} /> Add
                </button>
              </div>
              {playbook.evidenceNeeds.map((need) => {
                const present = capturedCategories.has(need.id)
                return (
                  <div key={need.id}>
                    <span className={present ? 'evidence-coverage--present' : ''}>
                      {present ? <Check size={13} /> : <Circle size={13} />}
                    </span>
                    <p>
                      <strong>{need.label}</strong>
                      <small>{need.required ? 'Core prompt' : 'Helpful context'}</small>
                    </p>
                  </div>
                )
              })}
            </article>
          </aside>
        </div>
      )}

      {tab === 'timeline' && (
        <section className="case-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Fact-first chronology</span>
              <h2>{snapshot.events.length} events, newest first</h2>
            </div>
            <button className="button button--ink" onClick={() => setEventOpen(true)}>
              <Plus size={16} /> Add event
            </button>
          </div>
          <div className="timeline-layout">
            <div className="timeline">
              {sortedEvents.length ? (
                sortedEvents.map((event) => <TimelineEvent event={event} key={event.id} />)
              ) : (
                <div className="empty-state empty-state--compact">
                  <MessageSquareText size={28} />
                  <h2>The timeline is empty.</h2>
                  <p>Start with what happened, when, and who was involved.</p>
                </div>
              )}
            </div>
            <aside className="timeline-guide">
              <Sparkles size={20} />
              <span className="eyebrow">A credible note is boring</span>
              <h3>Capture facts before conclusions.</h3>
              <ul>
                <li>Use exact dates and names.</li>
                <li>Separate direct quotes from summaries.</li>
                <li>Record how you know each fact.</li>
                <li>Follow calls with a written recap.</li>
              </ul>
            </aside>
          </div>
        </section>
      )}

      {tab === 'evidence' && (
        <section className="case-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Files & fingerprints</span>
              <h2>{snapshot.evidence.length} files stored locally</h2>
            </div>
            <button className="button button--ink" onClick={() => setEvidenceOpen(true)}>
              <Plus size={16} /> Add evidence
            </button>
          </div>
          <div className="integrity-banner">
            <Fingerprint size={22} />
            <div>
              <strong>Every file has a SHA-256 integrity fingerprint.</strong>
              <p>
                This helps detect changed bytes. It is not a trusted timestamp or legal chain of
                custody.
              </p>
            </div>
          </div>
          {snapshot.evidence.length ? (
            <div className="evidence-grid">
              {snapshot.evidence.map((item) => {
                const need = playbook.evidenceNeeds.find((entry) => entry.id === item.category)
                return (
                  <article key={item.id}>
                    <div className="evidence-card__preview">
                      <FileText size={28} />
                      <span>{item.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                    </div>
                    <div className="evidence-card__body">
                      <span className="eyebrow">{need?.label ?? 'Other context'}</span>
                      <h3 title={item.name}>{item.name}</h3>
                      <p>{item.note || 'No relevance note added.'}</p>
                      <div className="evidence-card__meta">
                        <span>{formatBytes(item.size)}</span>
                        <span>Added {formatDate(item.addedAt)}</span>
                      </div>
                      <button
                        className="hash-chip"
                        onClick={async () => {
                          await navigator.clipboard?.writeText(item.hash)
                          onToast('Full SHA-256 copied.')
                        }}
                        title={item.hash}
                      >
                        <Fingerprint size={13} />
                        {shortHash(item.hash)}
                        <Copy size={12} />
                      </button>
                    </div>
                    <div className="evidence-card__actions">
                      <button onClick={() => downloadEvidence(item)}>
                        <Download size={15} /> Download
                      </button>
                        <button
                          onClick={async () => {
                            const linkedCount = snapshot.commitments.filter(
                              (commitment) => commitment.sourceEvidenceId === item.id,
                            ).length
                            const linkedWarning = linkedCount
                              ? ` ${linkedCount} promise${
                                  linkedCount === 1 ? '' : 's'
                                } will keep a visible reference showing that the linked file was removed.`
                              : ''
                            if (
                              !window.confirm(
                                `Remove “${item.name}” from this browser?${linkedWarning}`,
                              )
                            )
                              return
                            const removedAt = new Date().toISOString()
                            const linkedCommitments = snapshot.commitments.filter(
                              (commitment) => commitment.sourceEvidenceId === item.id,
                            )
                            await db.transaction(
                              'rw',
                              [db.evidence, db.commitments, db.cases],
                              async () => {
                                await Promise.all(
                                  linkedCommitments.map((commitment) =>
                                    db.commitments.update(commitment.id, {
                                      sourceEvidenceId: undefined,
                                      sourceEvidenceRemoved: {
                                        id: item.id,
                                        name: item.name,
                                        hash: item.hash,
                                        removedAt,
                                      },
                                    }),
                                  ),
                                )
                                await db.evidence.delete(item.id)
                                await db.cases.update(snapshot.case.id, { updatedAt: removedAt })
                              },
                            )
                          onToast('Local evidence file removed.')
                        }}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state empty-state--compact">
              <FileCheck2 size={29} />
              <h2>No files stored yet.</h2>
              <p>Add the original file; Plaincase will fingerprint and keep it in this browser.</p>
            </div>
          )}
        </section>
      )}

      {tab === 'promises' && (
        <section className="case-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Promise ledger</span>
              <h2>Who said they would do what?</h2>
            </div>
            <button className="button button--ink" onClick={() => setCommitmentOpen(true)}>
              <Plus size={16} /> Record promise
            </button>
          </div>
          <div className="promise-intro">
            <Flag size={20} />
            <p>
              Ordinary case trackers store messages. Plaincase lets you pull out the commitments
              inside them, cite the source, and make missed follow-through visible.
            </p>
          </div>
          {snapshot.commitments.length ? (
            <div className="promise-ledger">
              <div className="promise-ledger__head">
                <span>Maker</span>
                <span>Commitment</span>
                <span>Due</span>
                <span>Status</span>
              </div>
              {[...snapshot.commitments]
                .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
                .map((item) => {
                  const sourceEvent = snapshot.events.find(
                    (event) => event.id === item.sourceEventId,
                  )
                  const sourceEvidence = snapshot.evidence.find(
                    (evidence) => evidence.id === item.sourceEvidenceId,
                  )
                  return (
                  <article key={item.id}>
                    <div className="promise-ledger__maker">
                      <span>{item.maker.charAt(0).toUpperCase()}</span>
                      <strong>{item.maker}</strong>
                    </div>
                    <p>{item.detail}</p>
                    <time>
                      <strong>{formatDate(item.dueAt)}</strong>
                      <small>{relativeDate(item.dueAt)}</small>
                    </time>
                    <select
                      className={`promise-status promise-status--${item.status}`}
                      value={item.status}
                      onChange={async (event) => {
                        const nextStatus = event.target.value as 'open' | 'kept' | 'missed'
                        if (nextStatus === item.status) return
                        const note = window.prompt(
                          'Add a short factual outcome note. This will be appended to the timeline.',
                          nextStatus === 'kept'
                            ? 'The promised action was completed.'
                            : nextStatus === 'missed'
                              ? 'The due date passed without the promised action.'
                              : 'This commitment is open again.',
                        )
                        if (note === null) return
                        const now = new Date().toISOString()
                        await db.transaction(
                          'rw',
                          [db.commitments, db.events, db.cases],
                          async () => {
                            await db.commitments.update(item.id, {
                              status: nextStatus,
                              history: [
                                ...(item.history ?? []),
                                {
                                  id: makeId('history'),
                                  status: nextStatus,
                                  at: now,
                                  note: note.trim() || undefined,
                                },
                              ],
                            })
                            await db.events.add({
                              id: makeId('event'),
                              caseId: snapshot.case.id,
                              kind: 'note',
                              title: `Promise marked ${nextStatus}`,
                              detail: `${item.maker}: ${item.detail}${
                                note.trim() ? `\n\nOutcome note: ${note.trim()}` : ''
                              }`,
                              actor: 'Me',
                              channel: 'Promise ledger',
                              commitmentId: item.id,
                              occurredAt: now,
                              createdAt: now,
                            })
                            await db.cases.update(snapshot.case.id, { updatedAt: now })
                          },
                        )
                        onToast('Promise status updated.')
                      }}
                      aria-label={`Status for ${item.maker}'s promise`}
                    >
                      <option value="open">Open</option>
                      <option value="kept">Kept</option>
                      <option value="missed">Missed</option>
                    </select>
                    <div className="promise-source">
                      <span>
                        <Fingerprint size={13} />
                        Traceable source
                      </span>
                      {sourceEvent ? (
                        <button
                          onClick={() => {
                            setTab('timeline')
                            window.setTimeout(() => {
                              document
                                .getElementById(`timeline-${sourceEvent.id}`)
                                ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 50)
                          }}
                        >
                          <MessageSquareText size={13} />
                          {formatDate(sourceEvent.occurredAt)} · {sourceEvent.title}
                        </button>
                      ) : (
                        <em>Source event unavailable</em>
                      )}
                      {sourceEvidence && (
                        <button onClick={() => downloadEvidence(sourceEvidence)}>
                          <FileText size={13} />
                          {sourceEvidence.name}
                        </button>
                      )}
                      {item.sourceEvidenceRemoved && (
                        <em
                          title={`Removed ${formatDateTime(
                            item.sourceEvidenceRemoved.removedAt,
                          )} · retained file ID: ${item.sourceEvidenceRemoved.id}`}
                        >
                          Linked file removed · {item.sourceEvidenceRemoved.name} · fingerprint
                          retained
                        </em>
                      )}
                      <button
                        onClick={async () => {
                          const quoted = item.sourceExcerpt || item.detail
                          const followUp = `Subject: Follow-up — ${snapshot.case.title}

Hello ${item.maker},

I’m following up on this commitment${
                            sourceEvent ? ` from ${formatDate(sourceEvent.occurredAt)}` : ''
                          }:

“${quoted}”

The recorded due date is ${formatDate(item.dueAt)}. Please confirm the current status and next step in writing.

Thank you.`
                          await copyText(followUp)
                          onToast('Neutral follow-up copied to the clipboard.')
                        }}
                      >
                        <Mail size={13} />
                        Copy neutral follow-up
                      </button>
                      {item.sourceExcerpt && <blockquote>“{item.sourceExcerpt}”</blockquote>}
                      {(item.history ?? []).length > 1 && (
                        <details className="promise-history">
                          <summary>{item.history.length} append-only status entries</summary>
                          <div>
                            {item.history.map((entry) => (
                              <span key={entry.id}>
                                <strong>{entry.status}</strong>
                                <time>{formatDateTime(entry.at)}</time>
                                {entry.note && <em>{entry.note}</em>}
                              </span>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </article>
                  )
                })}
            </div>
          ) : (
            <div className="empty-state empty-state--compact">
              <Flag size={29} />
              <h2>No promises recorded.</h2>
              <p>Add a commitment with a maker, exact action, and due date.</p>
            </div>
          )}
        </section>
      )}

      {tab === 'pack' && (
        <section className="case-pack">
          <div className="case-pack__intro">
            <span className="eyebrow">Portable by design</span>
            <h2>Turn this record into a five-minute handoff.</h2>
            <p>
              Export one ordinary ZIP with a readable brief, chronology, promise ledger, file
              manifest, fingerprints, and the original evidence. No recipient account is needed.
            </p>
            <button className="button button--lime button--large" onClick={buildPack} disabled={exporting}>
              <FileArchive size={18} />
              {exporting ? 'Building locally…' : 'Build case pack'}
            </button>
            <small>
              <ShieldCheck size={14} /> Built entirely in this browser
            </small>
          </div>
          <div className="pack-preview">
            <div className="pack-preview__window">
              <header>
                <span />
                <span />
                <span />
                <small>{snapshot.case.title.toLowerCase().replaceAll(' ', '-')}-case-pack.zip</small>
              </header>
              <div className="pack-tree">
                <span>
                  <FileText size={15} /> case-brief.md <em>Readable summary</em>
                </span>
                <span>
                  <FileText size={15} /> timeline.csv <em>{snapshot.events.length} events</em>
                </span>
                <span>
                  <Flag size={15} /> promise-ledger.csv <em>{snapshot.commitments.length} promises</em>
                </span>
                <span>
                  <Fingerprint size={15} /> integrity-manifest.json <em>SHA-256</em>
                </span>
                <span>
                  <FileArchive size={15} /> evidence/ <em>{snapshot.evidence.length} originals</em>
                </span>
              </div>
            </div>
            <div className="pack-checklist">
              <span className="eyebrow">Before you share</span>
              {[
                'Check names, dates, and factual descriptions.',
                'Remove private files the recipient does not need.',
                'Open the exported brief and verify the chronology.',
                'Choose a secure delivery method for the audience.',
              ].map((item) => (
                <span key={item}>
                  <Check size={14} /> {item}
                </span>
              ))}
            </div>
          </div>
          <div className="case-pack__footer">
            <Info size={18} />
            <p>
              Plaincase exports an organizational record, not an official filing. If stakes are
              high, ask a qualified adviser what to include and how to preserve originals.
            </p>
            <a href="#/data">
              Security model <ExternalLink size={14} />
            </a>
          </div>
        </section>
      )}

      <AddEventModal
        caseRecord={snapshot.case}
        open={eventOpen}
        onClose={() => setEventOpen(false)}
        onSaved={onToast}
      />
      <AddEvidenceModal
        caseRecord={snapshot.case}
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        onSaved={onToast}
      />
      <AddCommitmentModal
        caseRecord={snapshot.case}
        open={commitmentOpen}
        onClose={() => setCommitmentOpen(false)}
        onSaved={onToast}
      />
      <AddTaskModal
        caseRecord={snapshot.case}
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        onSaved={onToast}
      />
      <EditCaseModal
        caseRecord={snapshot.case}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={onToast}
      />
    </div>
  )
}
