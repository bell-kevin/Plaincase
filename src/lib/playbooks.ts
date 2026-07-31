import type { Playbook } from '../types'

export const playbooks: Playbook[] = [
  {
    id: 'home-repair',
    eyebrow: 'Home & renting',
    title: 'Repair that keeps stalling',
    shortTitle: 'Home repair',
    description:
      'Keep the condition, notices, access attempts, promises, and costs in one chronological record.',
    goalPrompt: 'What would a workable resolution look like?',
    color: '#ff7657',
    evidenceNeeds: [
      {
        id: 'agreement',
        label: 'Agreement or lease',
        description: 'The page that identifies the home, parties, and repair responsibilities.',
        required: true,
      },
      {
        id: 'condition',
        label: 'Condition evidence',
        description: 'Dated photos, video, readings, or a clear written description.',
        required: true,
      },
      {
        id: 'notice',
        label: 'Written notice',
        description: 'A copy of what you sent, when, how, and to whom.',
        required: true,
      },
      {
        id: 'response',
        label: 'Response or promise',
        description: 'A reply, appointment, work order, or documented lack of response.',
        required: false,
      },
      {
        id: 'cost',
        label: 'Related costs',
        description: 'Receipts or estimates tied to the unresolved condition.',
        required: false,
      },
    ],
    steps: [
      {
        id: 'capture',
        title: 'Capture the condition',
        description: 'Record what happened without interpretation and preserve the originals.',
        prompt: 'What can someone independently see, hear, measure, or verify?',
      },
      {
        id: 'contact',
        title: 'Put the request in writing',
        description: 'State the condition, the requested result, and a practical reply date.',
        prompt: 'What exactly are you asking the other party to do?',
      },
      {
        id: 'follow-up',
        title: 'Close the loop',
        description: 'Log access attempts, appointments, work performed, and every commitment.',
        prompt: 'What was promised, by whom, and by when?',
      },
      {
        id: 'escalate',
        title: 'Prepare a clean handoff',
        description: 'Export a concise chronology and supporting files for a trusted adviser.',
        prompt: 'Can a new reader understand the story in five minutes?',
      },
    ],
  },
  {
    id: 'purchase-problem',
    eyebrow: 'Purchases & services',
    title: 'Purchase or service problem',
    shortTitle: 'Purchase issue',
    description:
      'Connect the order, advertised promise, defect, seller contact, and requested resolution.',
    goalPrompt: 'Refund, replacement, repair, price adjustment—or something else?',
    color: '#b9e5ff',
    evidenceNeeds: [
      {
        id: 'agreement',
        label: 'Receipt or order',
        description: 'Purchase date, seller, item or service, and amount paid.',
        required: true,
      },
      {
        id: 'promise',
        label: 'Listing or promise',
        description: 'The description, quote, warranty, or terms you relied on.',
        required: true,
      },
      {
        id: 'condition',
        label: 'Problem evidence',
        description: 'Dated photos, test results, delivery condition, or work defects.',
        required: true,
      },
      {
        id: 'notice',
        label: 'Seller contact',
        description: 'Messages showing when you raised the problem and what you requested.',
        required: true,
      },
      {
        id: 'response',
        label: 'Seller response',
        description: 'Replies, return labels, refusal, or proposed remedy.',
        required: false,
      },
    ],
    steps: [
      {
        id: 'capture',
        title: 'Freeze the facts',
        description: 'Save the order, listing, condition, packaging, and serial number.',
        prompt: 'What did you receive compared with what was promised?',
      },
      {
        id: 'contact',
        title: 'Ask for one clear remedy',
        description: 'Make a specific, proportionate request and retain the sent copy.',
        prompt: 'What single outcome would resolve this?',
      },
      {
        id: 'follow-up',
        title: 'Track every handoff',
        description: 'Log shipping, ticket numbers, agents, dates, and commitments.',
        prompt: 'Where is the item, request, or refund right now?',
      },
      {
        id: 'escalate',
        title: 'Build the compact record',
        description: 'Package the transaction, issue, contact attempts, and requested outcome.',
        prompt: 'What would a neutral reviewer need to verify your account?',
      },
    ],
  },
  {
    id: 'insurance-claim',
    eyebrow: 'Insurance',
    title: 'Insurance claim',
    shortTitle: 'Insurance claim',
    description:
      'Organize policy details, loss evidence, estimates, adjuster conversations, and decision letters.',
    goalPrompt: 'What claim result are you working toward?',
    color: '#c8f16f',
    evidenceNeeds: [
      {
        id: 'agreement',
        label: 'Policy or coverage page',
        description: 'The version in force on the incident date.',
        required: true,
      },
      {
        id: 'condition',
        label: 'Loss evidence',
        description: 'Original photos, video, inventory, reports, or incident details.',
        required: true,
      },
      {
        id: 'estimate',
        label: 'Estimate or valuation',
        description: 'Repair estimates, replacement values, or professional assessment.',
        required: true,
      },
      {
        id: 'notice',
        label: 'Claim submission',
        description: 'Claim number, submitted materials, and proof of delivery.',
        required: true,
      },
      {
        id: 'response',
        label: 'Decision correspondence',
        description: 'Requests, explanations, payment detail, or decision letters.',
        required: false,
      },
    ],
    steps: [
      {
        id: 'capture',
        title: 'Record the loss',
        description: 'Preserve originals and document reasonable mitigation.',
        prompt: 'What changed, when, and what supports that account?',
      },
      {
        id: 'contact',
        title: 'Map the claim',
        description: 'Record the claim number, handler, requested documents, and dates.',
        prompt: 'Who owns the next move and what are they waiting for?',
      },
      {
        id: 'follow-up',
        title: 'Reconcile the numbers',
        description: 'Keep estimates, valuations, payments, and explanations side by side.',
        prompt: 'Which amounts or assumptions do not match?',
      },
      {
        id: 'escalate',
        title: 'Make review easy',
        description: 'Export a factual chronology with a numbered evidence manifest.',
        prompt: 'What decision needs review, and on what evidence?',
      },
    ],
  },
  {
    id: 'contractor-work',
    eyebrow: 'Home & projects',
    title: 'Contractor disagreement',
    shortTitle: 'Contractor work',
    description:
      'Compare scope, changes, invoices, progress, defects, and completion promises without losing context.',
    goalPrompt: 'What completed work or financial resolution would settle this?',
    color: '#f7c86b',
    evidenceNeeds: [
      {
        id: 'agreement',
        label: 'Contract and scope',
        description: 'Signed agreement, quote, plans, and included or excluded work.',
        required: true,
      },
      {
        id: 'payment',
        label: 'Payments',
        description: 'Invoices, receipts, deposit, and payment schedule.',
        required: true,
      },
      {
        id: 'condition',
        label: 'Progress or defects',
        description: 'Dated site photos and a specific punch list.',
        required: true,
      },
      {
        id: 'change',
        label: 'Approved changes',
        description: 'Written change orders, revised pricing, or schedule changes.',
        required: false,
      },
      {
        id: 'notice',
        label: 'Resolution request',
        description: 'Your written request and a reasonable response date.',
        required: true,
      },
    ],
    steps: [
      {
        id: 'capture',
        title: 'Set the baseline',
        description: 'Collect the agreed scope, price, schedule, and payment record.',
        prompt: 'What was originally agreed in writing?',
      },
      {
        id: 'contact',
        title: 'Name the variance',
        description: 'Describe incomplete, changed, or disputed work item by item.',
        prompt: 'Which scope line, drawing, or promise does each issue relate to?',
      },
      {
        id: 'follow-up',
        title: 'Track the cure plan',
        description: 'Record site dates, promised fixes, access, and revised completion dates.',
        prompt: 'What will be done, by whom, and when?',
      },
      {
        id: 'escalate',
        title: 'Package the project record',
        description: 'Connect scope items to photos, invoices, changes, and promises.',
        prompt: 'Can each disputed point be traced to the agreement and evidence?',
      },
    ],
  },
  {
    id: 'medical-bill',
    eyebrow: 'Bills & benefits',
    title: 'Medical bill question',
    shortTitle: 'Medical bill',
    description:
      'Reconcile statements, benefit explanations, codes, calls, requests, and payment status.',
    goalPrompt: 'What amount, code, coverage decision, or explanation needs correction?',
    color: '#e3c9ff',
    evidenceNeeds: [
      {
        id: 'bill',
        label: 'Provider statement',
        description: 'The bill and any itemized version, with private details handled carefully.',
        required: true,
      },
      {
        id: 'benefits',
        label: 'Benefits explanation',
        description: 'The matching explanation of benefits or coverage response.',
        required: true,
      },
      {
        id: 'agreement',
        label: 'Plan information',
        description: 'Relevant coverage summary, estimate, or authorization.',
        required: false,
      },
      {
        id: 'notice',
        label: 'Correction request',
        description: 'A dated copy of your question, correction, or review request.',
        required: true,
      },
      {
        id: 'response',
        label: 'Response or revised bill',
        description: 'Reference numbers, replies, adjustments, or updated statements.',
        required: false,
      },
    ],
    steps: [
      {
        id: 'capture',
        title: 'Match the documents',
        description: 'Line up dates, providers, amounts, codes, and coverage records.',
        prompt: 'Which exact line or amount does not reconcile?',
      },
      {
        id: 'contact',
        title: 'Request specifics',
        description: 'Ask for the itemization or explanation needed to verify the charge.',
        prompt: 'What missing detail would let you check the bill?',
      },
      {
        id: 'follow-up',
        title: 'Log references and holds',
        description: 'Record every call, ticket, temporary hold, and promised adjustment.',
        prompt: 'What did the representative say would happen next?',
      },
      {
        id: 'escalate',
        title: 'Create a review record',
        description: 'Export a privacy-reviewed chronology and the relevant documents.',
        prompt: 'What should a reviewer correct or explain?',
      },
    ],
  },
  {
    id: 'other',
    eyebrow: 'Flexible',
    title: 'Something else',
    shortTitle: 'General record',
    description:
      'Use the same fact-first timeline, promise ledger, and evidence manifest for any unresolved matter.',
    goalPrompt: 'What concrete outcome would let you close this?',
    color: '#c6d3cd',
    evidenceNeeds: [
      {
        id: 'agreement',
        label: 'Starting document',
        description: 'The agreement, policy, receipt, or message that frames the matter.',
        required: true,
      },
      {
        id: 'condition',
        label: 'What happened',
        description: 'A contemporaneous record supporting the key facts.',
        required: true,
      },
      {
        id: 'notice',
        label: 'Your request',
        description: 'A dated copy of what you asked the other party to do.',
        required: true,
      },
      {
        id: 'response',
        label: 'Their response',
        description: 'Reply, decision, promise, or recorded absence of response.',
        required: false,
      },
    ],
    steps: [
      {
        id: 'capture',
        title: 'Establish the facts',
        description: 'Record events while details are fresh and preserve original files.',
        prompt: 'What happened, when, where, and who was involved?',
      },
      {
        id: 'contact',
        title: 'Make the ask clear',
        description: 'State the result you want and keep a copy of the request.',
        prompt: 'What specific action would resolve the matter?',
      },
      {
        id: 'follow-up',
        title: 'Track movement',
        description: 'Log replies, commitments, deadlines, and completed actions.',
        prompt: 'Who owns the next move?',
      },
      {
        id: 'escalate',
        title: 'Prepare the handoff',
        description: 'Package only the facts and files a new reader actually needs.',
        prompt: 'What is the shortest complete version of the story?',
      },
    ],
  },
]

export function getPlaybook(id: string): Playbook {
  return playbooks.find((playbook) => playbook.id === id) ?? playbooks[playbooks.length - 1]
}
