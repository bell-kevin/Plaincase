export type CaseStatus = 'active' | 'waiting' | 'resolved' | 'archived'
export type CaseStage = 'capture' | 'contact' | 'follow-up' | 'escalate' | 'resolved'
export type EventKind =
  | 'note'
  | 'message'
  | 'call'
  | 'meeting'
  | 'payment'
  | 'incident'
  | 'deadline'
export type CommitmentStatus = 'open' | 'kept' | 'missed'
export type TaskStatus = 'open' | 'done'
export type RadarSeverity = 'now' | 'soon' | 'gap' | 'good'

export interface CaseRecord {
  id: string
  title: string
  playbookId: string
  status: CaseStatus
  stage: CaseStage
  summary: string
  goal: string
  counterparty: string
  reference?: string
  amount?: number
  targetDate?: string
  createdAt: string
  updatedAt: string
  accent: string
}

export interface CaseEvent {
  id: string
  caseId: string
  kind: EventKind
  title: string
  detail: string
  occurredAt: string
  actor: string
  channel?: string
  commitmentId?: string
  createdAt: string
}

export interface EvidenceItem {
  id: string
  caseId: string
  name: string
  mimeType: string
  size: number
  category: string
  hash: string
  addedAt: string
  occurredAt?: string
  note?: string
  blob: Blob
}

export interface Commitment {
  id: string
  caseId: string
  maker: string
  detail: string
  dueAt: string
  status: CommitmentStatus
  sourceEventId?: string
  sourceEvidenceId?: string
  sourceEvidenceRemoved?: RemovedEvidenceReference
  sourceExcerpt?: string
  history: CommitmentHistoryEntry[]
  createdAt: string
}

export interface RemovedEvidenceReference {
  id: string
  name: string
  hash: string
  removedAt: string
}

export interface CommitmentHistoryEntry {
  id: string
  status: CommitmentStatus
  at: string
  note?: string
}

export interface CaseTask {
  id: string
  caseId: string
  title: string
  dueAt?: string
  status: TaskStatus
  completedAt?: string
  createdAt: string
}

export interface EvidenceNeed {
  id: string
  label: string
  description: string
  required: boolean
}

export interface PlaybookStep {
  id: string
  title: string
  description: string
  prompt: string
}

export interface Playbook {
  id: string
  eyebrow: string
  title: string
  shortTitle: string
  description: string
  goalPrompt: string
  color: string
  evidenceNeeds: EvidenceNeed[]
  steps: PlaybookStep[]
}

export interface CaseSnapshot {
  case: CaseRecord
  events: CaseEvent[]
  evidence: EvidenceItem[]
  commitments: Commitment[]
  tasks: CaseTask[]
}

export interface RadarItem {
  id: string
  caseId: string
  severity: RadarSeverity
  label: string
  explanation: string
  action: string
  dueAt?: string
}

export interface BackupEnvelope {
  format: 'plaincase-backup'
  version: 1
  exportedAt: string
  cases: CaseRecord[]
  events: CaseEvent[]
  evidence: Array<Omit<EvidenceItem, 'blob'> & { dataUrl: string }>
  commitments: Commitment[]
  tasks: CaseTask[]
}
