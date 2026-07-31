import { describe, expect, it } from 'vitest'
import type { CaseSnapshot } from '../types'
import { getCompleteness, getRadar } from './radar'
import { escapeCsv } from './utils'

const now = new Date('2026-07-30T12:00:00.000Z')

function snapshot(overrides: Partial<CaseSnapshot> = {}): CaseSnapshot {
  return {
    case: {
      id: 'case_test',
      title: 'Test repair',
      playbookId: 'home-repair',
      status: 'active',
      stage: 'follow-up',
      summary: 'A factual summary',
      goal: 'A complete lasting repair by the target date.',
      counterparty: 'Example Company',
      targetDate: '2026-08-10',
      createdAt: '2026-07-01T12:00:00.000Z',
      updatedAt: '2026-07-29T12:00:00.000Z',
      accent: '#ff7657',
    },
    events: [
      {
        id: 'event_1',
        caseId: 'case_test',
        kind: 'message',
        title: 'Written request sent',
        detail: 'Asked for a repair.',
        occurredAt: '2026-07-20T12:00:00.000Z',
        actor: 'Me',
        createdAt: '2026-07-20T12:00:00.000Z',
      },
    ],
    evidence: [],
    commitments: [],
    tasks: [],
    ...overrides,
  }
}

describe('case radar', () => {
  it('surfaces overdue traceable commitments first', () => {
    const result = getRadar(
      snapshot({
        commitments: [
          {
            id: 'promise_1',
            caseId: 'case_test',
            maker: 'Example Company',
            detail: 'Send a technician.',
            dueAt: '2026-07-27',
            status: 'open',
            sourceEventId: 'event_1',
            sourceExcerpt: 'We will send a technician by Monday.',
            history: [
              {
                id: 'history_1',
                status: 'open',
                at: '2026-07-20T12:00:00.000Z',
              },
            ],
            createdAt: '2026-07-20T12:00:00.000Z',
          },
        ],
      }),
      now,
    )

    expect(result[0].severity).toBe('now')
    expect(result[0].label).toContain('promise is')
    expect(result[0].label).toContain('late')
  })

  it('finds missing required playbook evidence', () => {
    const result = getRadar(snapshot(), now)
    const gaps = result.filter((item) => item.severity === 'gap')

    expect(gaps.length).toBeGreaterThan(0)
    expect(gaps.some((item) => item.label.includes('missing'))).toBe(true)
  })

  it('flags a call without a later written recap', () => {
    const result = getRadar(
      snapshot({
        events: [
          {
            id: 'event_call',
            caseId: 'case_test',
            kind: 'call',
            title: 'Support call',
            detail: 'A phone-only commitment.',
            occurredAt: '2026-07-29T12:00:00.000Z',
            actor: 'Support',
            createdAt: '2026-07-29T12:00:00.000Z',
          },
        ],
      }),
      now,
    )

    expect(result.some((item) => item.id === 'call-followup-event_call')).toBe(true)
  })
})

describe('record coverage', () => {
  it('rewards core evidence and chronology without claiming outcome strength', () => {
    const emptyScore = getCompleteness(snapshot())
    const completeScore = getCompleteness(
      snapshot({
        evidence: ['agreement', 'condition', 'notice', 'response', 'cost'].map((category) => ({
          id: `evidence_${category}`,
          caseId: 'case_test',
          name: `${category}.txt`,
          mimeType: 'text/plain',
          size: 10,
          category,
          hash: 'a'.repeat(64),
          addedAt: '2026-07-29T12:00:00.000Z',
          blob: new Blob(['test']),
        })),
        tasks: [
          {
            id: 'task_1',
            caseId: 'case_test',
            title: 'Follow up',
            status: 'open',
            createdAt: '2026-07-29T12:00:00.000Z',
          },
        ],
      }),
    )

    expect(completeScore).toBeGreaterThan(emptyScore)
    expect(completeScore).toBeLessThanOrEqual(100)
  })
})

describe('portable export safety', () => {
  it('neutralizes spreadsheet formulas while preserving ordinary values', () => {
    expect(escapeCsv('=HYPERLINK("https://example.test")')).toBe(
      '"\'=HYPERLINK(""https://example.test"")"',
    )
    expect(escapeCsv('ordinary note')).toBe('"ordinary note"')
  })
})
