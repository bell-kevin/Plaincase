import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  FileCheck2,
  FolderOpen,
  Plus,
  Sparkles,
} from 'lucide-react'
import { CaseCard, ScoreRing } from '../components/CaseCard'
import { getCompleteness, getRadar } from '../lib/radar'
import { formatDate, formatMoney } from '../lib/utils'
import type { CaseSnapshot, RadarItem } from '../types'

interface DashboardProps {
  snapshots: CaseSnapshot[]
  onNavigate: (path: string) => void
  onNewCase: () => void
}

function priorityScore(item: RadarItem): number {
  return { now: 0, soon: 1, gap: 2, good: 3 }[item.severity]
}

export function Dashboard({ snapshots, onNavigate, onNewCase }: DashboardProps) {
  const active = snapshots.filter(
    (snapshot) => snapshot.case.status !== 'resolved' && snapshot.case.status !== 'archived',
  )
  const allRadar = active
    .flatMap((snapshot) => getRadar(snapshot))
    .sort(
      (a, b) =>
        priorityScore(a) - priorityScore(b) ||
        (a.dueAt ?? '9999-12-31').localeCompare(b.dueAt ?? '9999-12-31'),
    )
  const priority = allRadar[0]
  const priorityCase = priority
    ? snapshots.find((snapshot) => snapshot.case.id === priority.caseId)
    : undefined
  const openPromises = active.flatMap((snapshot) =>
    snapshot.commitments.filter((item) => item.status === 'open'),
  )
  const evidenceCount = snapshots.reduce((sum, snapshot) => sum + snapshot.evidence.length, 0)
  const trackedValue = active.reduce((sum, snapshot) => sum + (snapshot.case.amount ?? 0), 0)

  if (snapshots.length === 0) {
    return (
      <div className="first-run">
        <span className="eyebrow">Private by default</span>
        <h1>Make your paper trail make sense.</h1>
        <p>
          Turn messages, files, dates, and promises into one calm record—without an account,
          subscription, or upload.
        </p>
        <button className="button button--lime button--large" onClick={onNewCase}>
          <Plus size={19} />
          Start your first case
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <section className="page-heading">
        <div>
          <span className="eyebrow">Today’s desk check</span>
          <h1>
            Your paper trail,
            <br />
            <em>at a glance.</em>
          </h1>
        </div>
        <p>
          Plaincase scans only the structure you created. No cloud, no tracking, and no AI
          guessing at your rights.
        </p>
      </section>

      <div className="demo-ribbon">
        <Sparkles size={15} />
        <p>
          <strong>Fictional demo workspace.</strong> The sample cases are safe to explore; anything
          you add stays in this browser.
        </p>
        <button onClick={() => onNavigate('/data')}>Reset or clear demo</button>
      </div>

      <section className="dashboard-grid">
        <article className="focus-card">
          <div className="focus-card__head">
            <span>
              <Sparkles size={16} />
              Focus now
            </span>
            <small>Highest-priority signal</small>
          </div>
          {priority && priorityCase ? (
            <>
              <div className="focus-card__body">
                <span
                  className={`focus-card__flag focus-card__flag--${priority.severity}`}
                  aria-hidden="true"
                />
                <div>
                  <span className="eyebrow">{priorityCase.case.title}</span>
                  <h2>{priority.label}</h2>
                  <p>{priority.explanation}</p>
                </div>
              </div>
              <div className="focus-card__action">
                <div>
                  <span>Suggested next move</span>
                  <strong>{priority.action}</strong>
                </div>
                <button onClick={() => onNavigate(`/case/${priority.caseId}`)}>
                  Open case <ArrowRight size={17} />
                </button>
              </div>
            </>
          ) : (
            <div className="focus-card__empty">
              <FileCheck2 size={30} />
              <h2>Nothing needs attention right now.</h2>
              <p>Your active records have no immediate dates or evidence gaps.</p>
            </div>
          )}
        </article>

        <div className="metric-stack">
          <article className="metric-card metric-card--ink">
            <span>Open cases</span>
            <strong>{active.length.toString().padStart(2, '0')}</strong>
            <small>{formatMoney(trackedValue)} in tracked value</small>
            <FolderOpen size={25} />
          </article>
          <article className="metric-card metric-card--paper">
            <span>Promise ledger</span>
            <strong>{openPromises.length.toString().padStart(2, '0')}</strong>
            <small>
              {openPromises.length === 1 ? 'commitment still open' : 'commitments still open'}
            </small>
            <CalendarClock size={25} />
          </article>
          <article className="metric-card metric-card--blue">
            <span>Evidence files</span>
            <strong>{evidenceCount.toString().padStart(2, '0')}</strong>
            <small>fingerprinted locally</small>
            <FileCheck2 size={25} />
          </article>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your workspace</span>
            <h2>Cases in motion</h2>
          </div>
          <button className="text-button" onClick={() => onNavigate('/cases')}>
            View all <ChevronRight size={17} />
          </button>
        </div>
        <div className="case-grid">
          {active.slice(0, 3).map((snapshot) => (
            <CaseCard
              key={snapshot.case.id}
              snapshot={snapshot}
              onClick={() => onNavigate(`/case/${snapshot.case.id}`)}
            />
          ))}
          <button className="case-card case-card--new" onClick={onNewCase}>
            <span>
              <Plus size={23} />
            </span>
            <strong>Start another case</strong>
            <small>Choose a fact-first playbook</small>
          </button>
        </div>
      </section>

      <section className="desk-bottom">
        <article className="coverage-card">
          <div className="section-heading section-heading--compact">
            <div>
              <span className="eyebrow">Record coverage</span>
              <h2>Which stories need context?</h2>
            </div>
          </div>
          <div className="coverage-list">
            {active.map((snapshot) => {
              const score = getCompleteness(snapshot)
              return (
                <button
                  key={snapshot.case.id}
                  onClick={() => onNavigate(`/case/${snapshot.case.id}`)}
                >
                  <ScoreRing score={score} size="small" />
                  <span>
                    <strong>{snapshot.case.title}</strong>
                    <small>
                      {snapshot.evidence.length} files · {snapshot.events.length} events
                    </small>
                  </span>
                  <ChevronRight size={17} />
                </button>
              )
            })}
          </div>
        </article>
        <article className="principle-card">
          <div className="principle-card__number">01</div>
          <blockquote>“A useful record separates what happened from what you think it means.”</blockquote>
          <p>
            Plaincase prompts for observations, sources, promises, and dates. Interpretation stays
            yours.
          </p>
          <span>Fact-first design principle</span>
        </article>
      </section>

      <section className="upcoming-strip">
        <div>
          <span className="eyebrow">Coming up</span>
          <h2>Dates worth seeing early</h2>
        </div>
        <div className="upcoming-strip__items">
          {active
            .filter((snapshot) => snapshot.case.targetDate)
            .sort((a, b) => a.case.targetDate!.localeCompare(b.case.targetDate!))
            .slice(0, 3)
            .map((snapshot) => (
              <button
                key={snapshot.case.id}
                onClick={() => onNavigate(`/case/${snapshot.case.id}`)}
              >
                <span>{formatDate(snapshot.case.targetDate)}</span>
                <strong>{snapshot.case.title}</strong>
                <small>{snapshot.case.goal}</small>
              </button>
            ))}
        </div>
      </section>
    </div>
  )
}
