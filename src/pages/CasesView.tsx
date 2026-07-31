import { Filter, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CaseCard } from '../components/CaseCard'
import type { CaseSnapshot, CaseStatus } from '../types'

interface CasesViewProps {
  snapshots: CaseSnapshot[]
  onNavigate: (path: string) => void
  onNewCase: () => void
}

type FilterValue = 'all' | CaseStatus

export function CasesView({ snapshots, onNavigate, onNewCase }: CasesViewProps) {
  const [filter, setFilter] = useState<FilterValue>('all')
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return snapshots.filter((snapshot) => {
      const matchesStatus = filter === 'all' || snapshot.case.status === filter
      const matchesQuery =
        !normalized ||
        [snapshot.case.title, snapshot.case.counterparty, snapshot.case.reference]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalized))
      return matchesStatus && matchesQuery
    })
  }, [filter, query, snapshots])

  const counts = snapshots.reduce(
    (result, snapshot) => {
      result[snapshot.case.status] += 1
      return result
    },
    { active: 0, waiting: 0, resolved: 0, archived: 0 },
  )

  return (
    <div>
      <section className="page-heading page-heading--row">
        <div>
          <span className="eyebrow">All records</span>
          <h1>
            Cases,
            <br />
            <em>without the casework.</em>
          </h1>
        </div>
        <button className="button button--lime button--large" onClick={onNewCase}>
          <Plus size={18} />
          New case
        </button>
      </section>

      <section className="case-toolbar">
        <div className="case-toolbar__search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search this view"
            aria-label="Search this view"
          />
        </div>
        <div className="filter-tabs">
          <Filter size={16} />
          {(
            [
              ['all', 'All', snapshots.length],
              ['active', 'Moving', counts.active],
              ['waiting', 'Waiting', counts.waiting],
              ['resolved', 'Resolved', counts.resolved],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              className={filter === value ? 'filter-tabs--active' : ''}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              {label} <span>{count}</span>
            </button>
          ))}
        </div>
      </section>

      {filtered.length > 0 ? (
        <div className="case-grid case-grid--all">
          {filtered.map((snapshot) => (
            <CaseCard
              key={snapshot.case.id}
              snapshot={snapshot}
              onClick={() => onNavigate(`/case/${snapshot.case.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state empty-state--compact">
          <SlidersHorizontal size={29} />
          <h2>No cases match this view.</h2>
          <p>Try another status or a shorter search.</p>
        </div>
      )}
    </div>
  )
}
