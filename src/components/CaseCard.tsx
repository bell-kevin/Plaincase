import { ArrowUpRight, CheckCircle2, CircleDashed, Clock3, PauseCircle } from 'lucide-react'
import { getCompleteness, getRadar } from '../lib/radar'
import { getPlaybook } from '../lib/playbooks'
import { formatDate, relativeDate } from '../lib/utils'
import type { CaseSnapshot, CaseStatus } from '../types'

export function ScoreRing({ score, size = 'normal' }: { score: number; size?: 'small' | 'normal' }) {
  return (
    <div
      className={`score-ring score-ring--${size}`}
      style={{ '--score': `${score * 3.6}deg` } as React.CSSProperties}
      aria-label={`${score}% record coverage`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score}
      title="Record coverage, based on this playbook's evidence prompts and case activity"
    >
      <div>
        <strong>{score}</strong>
        {size === 'normal' && <span>%</span>}
      </div>
    </div>
  )
}

const statusLabels: Record<CaseStatus, string> = {
  active: 'Moving',
  waiting: 'Waiting',
  resolved: 'Resolved',
  archived: 'Archived',
}

export function StatusPill({ status }: { status: CaseStatus }) {
  const Icon =
    status === 'resolved'
      ? CheckCircle2
      : status === 'waiting'
        ? PauseCircle
        : status === 'active'
          ? CircleDashed
          : Clock3
  return (
    <span className={`status-pill status-pill--${status}`}>
      <Icon size={13} />
      {statusLabels[status]}
    </span>
  )
}

interface CaseCardProps {
  snapshot: CaseSnapshot
  onClick: () => void
}

export function CaseCard({ snapshot, onClick }: CaseCardProps) {
  const score = getCompleteness(snapshot)
  const radar = getRadar(snapshot)[0]
  const playbook = getPlaybook(snapshot.case.playbookId)

  return (
    <button className="case-card" onClick={onClick}>
      <span className="case-card__accent" style={{ background: snapshot.case.accent }} />
      <div className="case-card__top">
        <span className="case-card__type">{playbook.shortTitle}</span>
        <ArrowUpRight size={18} />
      </div>
      <div className="case-card__title">
        <h3>{snapshot.case.title}</h3>
        <p>{snapshot.case.counterparty || 'No counterparty recorded'}</p>
      </div>
      <div className="case-card__signal">
        <span className={`signal-dot signal-dot--${radar.severity}`} />
        <div>
          <small>{radar.severity === 'good' ? 'Next step' : 'Radar'}</small>
          <strong>{radar.label}</strong>
        </div>
      </div>
      <div className="case-card__footer">
        <div>
          <StatusPill status={snapshot.case.status} />
          <span className="case-card__date">
            {snapshot.case.targetDate
              ? `${formatDate(snapshot.case.targetDate)} · ${relativeDate(snapshot.case.targetDate)}`
              : 'No target date'}
          </span>
        </div>
        <ScoreRing score={score} size="small" />
      </div>
    </button>
  )
}
