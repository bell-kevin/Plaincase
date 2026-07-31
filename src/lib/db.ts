import Dexie, { type EntityTable } from 'dexie'
import { addDays, format, subDays, subHours } from 'date-fns'
import type {
  CaseEvent,
  CaseRecord,
  CaseSnapshot,
  CaseTask,
  Commitment,
  EvidenceItem,
} from '../types'
import { hashBlob, makeId } from './utils'

interface MetaRecord {
  key: string
  value: string
}

class PlaincaseDatabase extends Dexie {
  cases!: EntityTable<CaseRecord, 'id'>
  events!: EntityTable<CaseEvent, 'id'>
  evidence!: EntityTable<EvidenceItem, 'id'>
  commitments!: EntityTable<Commitment, 'id'>
  tasks!: EntityTable<CaseTask, 'id'>
  meta!: EntityTable<MetaRecord, 'key'>

  constructor() {
    super('plaincase')
    this.version(1).stores({
      cases: 'id, status, updatedAt, targetDate, playbookId',
      events: 'id, caseId, occurredAt, kind',
      evidence: 'id, caseId, addedAt, category',
      commitments: 'id, caseId, dueAt, status',
      tasks: 'id, caseId, dueAt, status',
      meta: 'key',
    })
  }
}

export const db = new PlaincaseDatabase()

function at(date: Date): string {
  return date.toISOString()
}

function day(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

async function sampleEvidence(
  id: string,
  caseId: string,
  name: string,
  category: string,
  note: string,
  occurredAt: Date,
): Promise<EvidenceItem> {
  const blob = new Blob(
    [
      `PLAINCASE DEMO DOCUMENT\n\n${name}\n\n${note}\n\nThis is fictional sample data created to demonstrate the app. Replace it with your own file.`,
    ],
    { type: 'text/plain' },
  )
  return {
    id,
    caseId,
    name,
    mimeType: blob.type,
    size: blob.size,
    category,
    hash: await hashBlob(blob),
    addedAt: at(new Date()),
    occurredAt: day(occurredAt),
    note,
    blob,
  }
}

async function seedDemoData(): Promise<void> {
  const now = new Date()
  const repairCase: CaseRecord = {
    id: 'case_demo_repair',
    title: 'Kitchen leak repair',
    playbookId: 'home-repair',
    status: 'active',
    stage: 'follow-up',
    summary:
      'A leak under the kitchen sink returned after a temporary repair. The cabinet base remains damp.',
    goal: 'A lasting repair, confirmation that the cabinet is dry, and reimbursement of the plumber visit.',
    counterparty: 'Juniper Property Co.',
    reference: 'WO-1842',
    amount: 185,
    targetDate: day(addDays(now, 3)),
    createdAt: at(subDays(now, 37)),
    updatedAt: at(subHours(now, 9)),
    accent: '#ff7657',
  }
  const purchaseCase: CaseRecord = {
    id: 'case_demo_camera',
    title: 'Camera arrived damaged',
    playbookId: 'purchase-problem',
    status: 'waiting',
    stage: 'contact',
    summary:
      'The camera body arrived with a cracked rear screen. The shipping box was dented on one corner.',
    goal: 'A prepaid return and full refund to the original payment method.',
    counterparty: 'Northstar Camera',
    reference: 'Order 104-8821',
    amount: 742,
    targetDate: day(addDays(now, 9)),
    createdAt: at(subDays(now, 6)),
    updatedAt: at(subDays(now, 1)),
    accent: '#b9e5ff',
  }
  const claimCase: CaseRecord = {
    id: 'case_demo_roof',
    title: 'Hail claim reconciliation',
    playbookId: 'insurance-claim',
    status: 'resolved',
    stage: 'resolved',
    summary:
      'The first estimate omitted two roof vents and disposal. A revised estimate was requested with photos.',
    goal: 'A written, line-by-line explanation and a corrected repair estimate.',
    counterparty: 'Evergreen Mutual',
    reference: 'CLM-29417',
    amount: 3260,
    targetDate: day(subDays(now, 8)),
    createdAt: at(subDays(now, 74)),
    updatedAt: at(subDays(now, 8)),
    accent: '#c8f16f',
  }

  const events: CaseEvent[] = [
    {
      id: 'event_repair_1',
      caseId: repairCase.id,
      kind: 'incident',
      title: 'Leak returned overnight',
      detail:
        'Found standing water in the cabinet at 7:10 AM. Shut off the cold-water valve and dried the visible water.',
      occurredAt: at(subDays(now, 18)),
      actor: 'Me',
      createdAt: at(subDays(now, 18)),
    },
    {
      id: 'event_repair_2',
      caseId: repairCase.id,
      kind: 'message',
      title: 'Repair request sent through resident portal',
      detail:
        'Requested a lasting repair and asked for a visit this week. Included two photos and work order WO-1842.',
      occurredAt: at(subDays(now, 18)),
      actor: 'Me',
      channel: 'Resident portal',
      createdAt: at(subDays(now, 18)),
    },
    {
      id: 'event_repair_3',
      caseId: repairCase.id,
      kind: 'meeting',
      title: 'Maintenance inspected the cabinet',
      detail:
        'Alex tightened the supply connection and said a replacement valve would be ordered if moisture returned.',
      occurredAt: at(subDays(now, 14)),
      actor: 'Alex · maintenance',
      channel: 'In person',
      createdAt: at(subDays(now, 14)),
    },
    {
      id: 'event_repair_4',
      caseId: repairCase.id,
      kind: 'call',
      title: 'Property manager promised a plumber visit',
      detail:
        'Mara said the plumber would contact me by Tuesday afternoon. No appointment has been received.',
      occurredAt: at(subDays(now, 5)),
      actor: 'Mara · property manager',
      channel: 'Phone',
      createdAt: at(subDays(now, 5)),
    },
    {
      id: 'event_camera_1',
      caseId: purchaseCase.id,
      kind: 'incident',
      title: 'Package opened and damage found',
      detail:
        'Rear screen was cracked on arrival. Photographed the sealed box, dented corner, packing, and camera before powering it on.',
      occurredAt: at(subDays(now, 6)),
      actor: 'Me',
      createdAt: at(subDays(now, 6)),
    },
    {
      id: 'event_camera_2',
      caseId: purchaseCase.id,
      kind: 'message',
      title: 'Return request submitted',
      detail:
        'Asked for a prepaid return label and full refund. Support ticket NS-9018 was created automatically.',
      occurredAt: at(subDays(now, 5)),
      actor: 'Me',
      channel: 'Email',
      createdAt: at(subDays(now, 5)),
    },
    {
      id: 'event_camera_3',
      caseId: purchaseCase.id,
      kind: 'message',
      title: 'Support requested serial number',
      detail: 'Replied with the serial-number photo and asked them to confirm the return address.',
      occurredAt: at(subDays(now, 1)),
      actor: 'Northstar support',
      channel: 'Email',
      createdAt: at(subDays(now, 1)),
    },
    {
      id: 'event_roof_1',
      caseId: claimCase.id,
      kind: 'incident',
      title: 'Hailstorm and initial inspection',
      detail: 'Photographed roof-edge damage and arranged a contractor inspection the following day.',
      occurredAt: at(subDays(now, 67)),
      actor: 'Me',
      createdAt: at(subDays(now, 67)),
    },
    {
      id: 'event_roof_2',
      caseId: claimCase.id,
      kind: 'message',
      title: 'Reconciliation sent to adjuster',
      detail:
        'Sent a three-line comparison showing omitted vents, disposal, and permit fee with supporting estimate pages.',
      occurredAt: at(subDays(now, 19)),
      actor: 'Me',
      channel: 'Email',
      createdAt: at(subDays(now, 19)),
    },
    {
      id: 'event_roof_3',
      caseId: claimCase.id,
      kind: 'payment',
      title: 'Revised estimate and supplemental payment received',
      detail: 'Carrier added the two vents and disposal line. Permit fee remains payable when incurred.',
      occurredAt: at(subDays(now, 8)),
      actor: 'Evergreen Mutual',
      channel: 'Claims portal',
      createdAt: at(subDays(now, 8)),
    },
  ]

  const commitments: Commitment[] = [
    {
      id: 'commitment_repair_1',
      caseId: repairCase.id,
      maker: 'Mara',
      detail: 'A plumber will contact me to schedule the replacement-valve visit.',
      dueAt: day(subDays(now, 2)),
      status: 'open',
      sourceEventId: 'event_repair_4',
      sourceExcerpt: 'The plumber will contact you by Tuesday afternoon.',
      history: [
        {
          id: 'history_repair_1',
          status: 'open',
          at: at(subDays(now, 5)),
          note: 'Captured from the phone call note.',
        },
      ],
      createdAt: at(subDays(now, 5)),
    },
    {
      id: 'commitment_camera_1',
      caseId: purchaseCase.id,
      maker: 'Northstar support',
      detail: 'Send the prepaid return label after the serial number is verified.',
      dueAt: day(addDays(now, 2)),
      status: 'open',
      sourceEventId: 'event_camera_3',
      sourceEvidenceId: 'evidence_camera_3',
      sourceExcerpt: 'Once we verify the serial number, we will issue the prepaid label.',
      history: [
        {
          id: 'history_camera_1',
          status: 'open',
          at: at(subDays(now, 1)),
          note: 'Captured from the support email.',
        },
      ],
      createdAt: at(subDays(now, 1)),
    },
    {
      id: 'commitment_roof_1',
      caseId: claimCase.id,
      maker: 'Evergreen Mutual',
      detail: 'Review the contractor comparison and issue a written response.',
      dueAt: day(subDays(now, 12)),
      status: 'kept',
      sourceEventId: 'event_roof_2',
      sourceEvidenceId: 'evidence_roof_5',
      sourceExcerpt: 'We will complete the supplemental review within five business days.',
      history: [
        {
          id: 'history_roof_1',
          status: 'open',
          at: at(subDays(now, 19)),
          note: 'Review timeline stated by the adjuster.',
        },
        {
          id: 'history_roof_2',
          status: 'kept',
          at: at(subDays(now, 8)),
          note: 'Revised estimate and payment explanation received.',
        },
      ],
      createdAt: at(subDays(now, 19)),
    },
  ]

  const tasks: CaseTask[] = [
    {
      id: 'task_repair_1',
      caseId: repairCase.id,
      title: 'Send a written recap of the missed plumber callback',
      dueAt: day(addDays(now, 1)),
      status: 'open',
      createdAt: at(subHours(now, 9)),
    },
    {
      id: 'task_camera_1',
      caseId: purchaseCase.id,
      title: 'Check for the prepaid label',
      dueAt: day(addDays(now, 2)),
      status: 'open',
      createdAt: at(subDays(now, 1)),
    },
    {
      id: 'task_roof_1',
      caseId: claimCase.id,
      title: 'Save the revised estimate with the closing note',
      status: 'done',
      completedAt: at(subDays(now, 8)),
      createdAt: at(subDays(now, 9)),
    },
  ]

  const evidence = await Promise.all([
    sampleEvidence(
      'evidence_repair_1',
      repairCase.id,
      'lease-repair-clause.txt',
      'agreement',
      'Excerpt identifying maintenance request channels and repair access.',
      subDays(now, 37),
    ),
    sampleEvidence(
      'evidence_repair_2',
      repairCase.id,
      'leak-photos-notes.txt',
      'condition',
      'Demo stand-in for the original photos taken when the leak returned.',
      subDays(now, 18),
    ),
    sampleEvidence(
      'evidence_repair_3',
      repairCase.id,
      'resident-portal-request.txt',
      'notice',
      'Copy of the initial written repair request and portal confirmation.',
      subDays(now, 18),
    ),
    sampleEvidence(
      'evidence_camera_1',
      purchaseCase.id,
      'order-confirmation.txt',
      'agreement',
      'Order number, item, purchase date, seller, and amount.',
      subDays(now, 8),
    ),
    sampleEvidence(
      'evidence_camera_2',
      purchaseCase.id,
      'arrival-condition.txt',
      'condition',
      'Demo stand-in for package, packing, screen, and serial-number photos.',
      subDays(now, 6),
    ),
    sampleEvidence(
      'evidence_camera_3',
      purchaseCase.id,
      'return-request.txt',
      'notice',
      'Sent email requesting a prepaid return and refund.',
      subDays(now, 5),
    ),
    sampleEvidence(
      'evidence_roof_1',
      claimCase.id,
      'coverage-summary.txt',
      'agreement',
      'Policy coverage page in force on the storm date.',
      subDays(now, 74),
    ),
    sampleEvidence(
      'evidence_roof_2',
      claimCase.id,
      'storm-condition-notes.txt',
      'condition',
      'Demo stand-in for timestamped exterior and roof-edge photos.',
      subDays(now, 67),
    ),
    sampleEvidence(
      'evidence_roof_3',
      claimCase.id,
      'contractor-estimate.txt',
      'estimate',
      'Repair estimate including vents, disposal, and permit.',
      subDays(now, 54),
    ),
    sampleEvidence(
      'evidence_roof_4',
      claimCase.id,
      'claim-submission.txt',
      'notice',
      'Claim number and submission confirmation.',
      subDays(now, 66),
    ),
    sampleEvidence(
      'evidence_roof_5',
      claimCase.id,
      'revised-estimate.txt',
      'response',
      'Revised carrier estimate and payment explanation.',
      subDays(now, 8),
    ),
  ])

  await db.transaction(
    'rw',
    [db.cases, db.events, db.evidence, db.commitments, db.tasks, db.meta],
    async () => {
      await db.cases.bulkPut([repairCase, purchaseCase, claimCase])
      await db.events.bulkPut(events)
      await db.evidence.bulkPut(evidence)
      await db.commitments.bulkPut(commitments)
      await db.tasks.bulkPut(tasks)
      await db.meta.put({ key: 'initialized', value: 'demo' })
    },
  )
}

export async function initializeDatabase(): Promise<void> {
  const initialized = await db.meta.get('initialized')
  if (!initialized) await seedDemoData()
}

export async function resetDemoData(): Promise<void> {
  await clearTables()
  await seedDemoData()
}

export async function clearAllData(): Promise<void> {
  await clearTables()
  await db.meta.put({ key: 'initialized', value: 'empty' })
}

async function clearTables(): Promise<void> {
  await db.transaction(
    'rw',
    [db.cases, db.events, db.evidence, db.commitments, db.tasks, db.meta],
    async () => {
      await Promise.all([
        db.cases.clear(),
        db.events.clear(),
        db.evidence.clear(),
        db.commitments.clear(),
        db.tasks.clear(),
        db.meta.clear(),
      ])
    },
  )
}

export async function getSnapshot(caseRecord: CaseRecord): Promise<CaseSnapshot> {
  const [events, evidence, commitments, tasks] = await Promise.all([
    db.events.where('caseId').equals(caseRecord.id).sortBy('occurredAt'),
    db.evidence.where('caseId').equals(caseRecord.id).toArray(),
    db.commitments.where('caseId').equals(caseRecord.id).toArray(),
    db.tasks.where('caseId').equals(caseRecord.id).toArray(),
  ])
  return { case: caseRecord, events, evidence, commitments, tasks }
}

export async function touchCase(caseId: string): Promise<void> {
  await db.cases.update(caseId, { updatedAt: new Date().toISOString() })
}

export async function createCase(
  input: Pick<
    CaseRecord,
    | 'title'
    | 'playbookId'
    | 'summary'
    | 'goal'
    | 'counterparty'
    | 'reference'
    | 'amount'
    | 'targetDate'
    | 'accent'
  >,
): Promise<string> {
  const id = makeId('case')
  const now = new Date().toISOString()
  await db.cases.add({
    ...input,
    id,
    status: 'active',
    stage: 'capture',
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function deleteCase(caseId: string): Promise<void> {
  await db.transaction(
    'rw',
    [db.cases, db.events, db.evidence, db.commitments, db.tasks],
    async () => {
      await Promise.all([
        db.cases.delete(caseId),
        db.events.where('caseId').equals(caseId).delete(),
        db.evidence.where('caseId').equals(caseId).delete(),
        db.commitments.where('caseId').equals(caseId).delete(),
        db.tasks.where('caseId').equals(caseId).delete(),
      ])
    },
  )
}
