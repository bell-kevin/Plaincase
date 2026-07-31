import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { CaseSnapshot, RadarItem } from '../types'
import { getPlaybook } from './playbooks'
import { clamp } from './utils'

const severityOrder = { now: 0, soon: 1, gap: 2, good: 3 }

export function getCompleteness(snapshot: CaseSnapshot): number {
  const playbook = getPlaybook(snapshot.case.playbookId)
  const required = playbook.evidenceNeeds.filter((need) => need.required)
  const recommended = playbook.evidenceNeeds.filter((need) => !need.required)
  const captured = new Set(snapshot.evidence.map((item) => item.category))
  const requiredPoints = required.reduce(
    (total, need) => total + (captured.has(need.id) ? 14 : 0),
    0,
  )
  const requiredMax = Math.max(required.length * 14, 1)
  const requiredScore = (requiredPoints / requiredMax) * 56
  const recommendedScore =
    recommended.length === 0
      ? 8
      : (recommended.filter((need) => captured.has(need.id)).length / recommended.length) * 8
  const timelineScore = Math.min(snapshot.events.length * 4, 16)
  const goalScore = snapshot.case.goal.trim().length > 12 ? 8 : 0
  const commitmentScore = snapshot.commitments.length > 0 ? 6 : 0
  const taskScore = snapshot.tasks.length > 0 ? 6 : 0

  return Math.round(
    clamp(requiredScore + recommendedScore + timelineScore + goalScore + commitmentScore + taskScore, 0, 100),
  )
}

export function getRadar(snapshot: CaseSnapshot, now = new Date()): RadarItem[] {
  const playbook = getPlaybook(snapshot.case.playbookId)
  const items: RadarItem[] = []
  const captured = new Set(snapshot.evidence.map((item) => item.category))

  snapshot.commitments
    .filter((commitment) => commitment.status === 'open')
    .forEach((commitment) => {
      const days = differenceInCalendarDays(parseISO(commitment.dueAt), now)
      if (days < 0) {
        items.push({
          id: `promise-overdue-${commitment.id}`,
          caseId: snapshot.case.id,
          severity: 'now',
          label: `${commitment.maker}'s promise is ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} late`,
          explanation: commitment.detail,
          action: 'Log what happened and send a written follow-up.',
          dueAt: commitment.dueAt,
        })
      } else if (days <= 3) {
        items.push({
          id: `promise-soon-${commitment.id}`,
          caseId: snapshot.case.id,
          severity: 'soon',
          label: `${commitment.maker}'s promise is due ${days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`}`,
          explanation: commitment.detail,
          action: 'Prepare a short follow-up in case the commitment is missed.',
          dueAt: commitment.dueAt,
        })
      }
    })

  if (snapshot.case.targetDate && snapshot.case.status !== 'resolved') {
    const days = differenceInCalendarDays(parseISO(snapshot.case.targetDate), now)
    if (days < 0) {
      items.push({
        id: `target-overdue-${snapshot.case.id}`,
        caseId: snapshot.case.id,
        severity: 'now',
        label: `Your target date passed ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`,
        explanation: snapshot.case.goal,
        action: 'Choose a new next step or revise the target date.',
        dueAt: snapshot.case.targetDate,
      })
    } else if (days <= 5) {
      items.push({
        id: `target-soon-${snapshot.case.id}`,
        caseId: snapshot.case.id,
        severity: 'soon',
        label: `Your target date is ${days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`}`,
        explanation: snapshot.case.goal,
        action: 'Review the record and decide who owns the next move.',
        dueAt: snapshot.case.targetDate,
      })
    }
  }

  const missingRequired = playbook.evidenceNeeds.filter(
    (need) => need.required && !captured.has(need.id),
  )
  missingRequired.slice(0, 2).forEach((need) => {
    items.push({
      id: `evidence-${snapshot.case.id}-${need.id}`,
      caseId: snapshot.case.id,
      severity: 'gap',
      label: `${need.label} is missing`,
      explanation: need.description,
      action: 'Add it now, or note why it is unavailable.',
    })
  })

  const latestCall = [...snapshot.events]
    .filter((event) => event.kind === 'call')
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0]
  const writtenAfterCall = latestCall
    ? snapshot.events.some(
        (event) =>
          event.kind === 'message' &&
          event.actor.trim().toLowerCase() === 'me' &&
          parseISO(event.occurredAt).getTime() > parseISO(latestCall.occurredAt).getTime(),
      )
    : true
  if (latestCall && !writtenAfterCall) {
    items.push({
      id: `call-followup-${latestCall.id}`,
      caseId: snapshot.case.id,
      severity: 'gap',
      label: 'The latest call has no written follow-up',
      explanation: `“${latestCall.title}” is only captured as a call note.`,
      action: 'Send a short factual recap and log the sent message.',
    })
  }

  const openTask = [...snapshot.tasks]
    .filter((task) => task.status === 'open')
    .sort((a, b) => (a.dueAt ?? '9999').localeCompare(b.dueAt ?? '9999'))[0]
  if (openTask) {
    const taskDays = openTask.dueAt
      ? differenceInCalendarDays(parseISO(openTask.dueAt), now)
      : undefined
    const overdue = taskDays !== undefined && taskDays < 0
    items.push({
      id: `task-${openTask.id}`,
      caseId: snapshot.case.id,
      severity: overdue ? 'now' : taskDays !== undefined && taskDays <= 2 ? 'soon' : 'good',
      label: overdue
        ? `Your next step is ${Math.abs(taskDays)} day${Math.abs(taskDays) === 1 ? '' : 's'} late`
        : openTask.title,
      explanation: overdue ? openTask.title : 'This is the next step you chose for this case.',
      action: overdue
        ? 'Do it now, choose a new date, or replace it with a more useful next step.'
        : 'Mark it complete when it is done.',
      dueAt: openTask.dueAt,
    })
  }

  if (items.length === 0) {
    items.push({
      id: `clear-${snapshot.case.id}`,
      caseId: snapshot.case.id,
      severity: 'good',
      label: 'The record is in good shape',
      explanation: 'No near-term dates, missed promises, or required evidence gaps were found.',
      action: 'Check back when something changes.',
    })
  }

  return items.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}
