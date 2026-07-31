import {
  Archive,
  BookOpenText,
  Code2,
  CalendarDays,
  Database,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CaseSnapshot } from '../types'
import { Logo } from './Logo'

export type AppRoute =
  | { page: 'desk' }
  | { page: 'cases' }
  | { page: 'case'; id: string }
  | { page: 'playbooks' }
  | { page: 'data' }

interface LayoutProps {
  route: AppRoute
  snapshots: CaseSnapshot[]
  children: React.ReactNode
  onNavigate: (path: string) => void
  onNewCase: () => void
  onExportCalendar: () => void
}

const navItems = [
  { page: 'desk', label: 'Desk', path: '/desk', icon: LayoutDashboard },
  { page: 'cases', label: 'Cases', path: '/cases', icon: Archive },
  { page: 'playbooks', label: 'Playbooks', path: '/playbooks', icon: BookOpenText },
  { page: 'data', label: 'Data & privacy', path: '/data', icon: Database },
] as const

export function Layout({
  route,
  snapshots,
  children,
  onNavigate,
  onNewCase,
  onExportCalendar,
}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const mobileMenuRef = useRef<HTMLButtonElement>(null)
  const sidebarCloseRef = useRef<HTMLButtonElement>(null)
  const activeCount = snapshots.filter(
    (snapshot) => snapshot.case.status === 'active' || snapshot.case.status === 'waiting',
  ).length
  const results = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return []
    return snapshots
      .filter((snapshot) =>
        [
          snapshot.case.title,
          snapshot.case.counterparty,
          snapshot.case.reference,
          snapshot.case.summary,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query)),
      )
      .slice(0, 5)
  }, [search, snapshots])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setSearch('')
  }, [route])

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT'
      if (event.key === '/' && !typing) {
        event.preventDefault()
        setSearchOpen(true)
        window.setTimeout(() => searchRef.current?.focus(), 0)
      }
      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearchOpen(false)
        searchRef.current?.blur()
      }
      if (event.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
        window.setTimeout(() => mobileMenuRef.current?.focus(), 0)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [mobileOpen])

  useEffect(() => {
    if (mobileOpen && window.innerWidth <= 800) sidebarCloseRef.current?.focus()
  }, [mobileOpen])

  function go(path: string) {
    onNavigate(path)
    setMobileOpen(false)
  }

  const currentPage = route.page === 'case' ? 'cases' : route.page

  return (
    <div className="app-shell">
      <button
        className="skip-link"
        onClick={() => document.getElementById('main-content')?.focus()}
      >
        Skip to content
      </button>

      <aside
        id="primary-sidebar"
        className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}
      >
        <div className="sidebar__top">
          <button
            ref={sidebarCloseRef}
            className="sidebar__close icon-button"
            onClick={() => {
              setMobileOpen(false)
              window.setTimeout(() => mobileMenuRef.current?.focus(), 0)
            }}
          >
            <X size={20} />
            <span className="sr-only">Close navigation</span>
          </button>
          <button className="logo-button" onClick={() => go('/desk')} aria-label="Go to desk">
            <Logo inverse />
          </button>
          <div className="privacy-chip">
            <ShieldCheck size={14} />
            <span>Browser-local</span>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Primary navigation">
          <span className="sidebar__label">Workspace</span>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.page}
                className={`nav-item ${currentPage === item.page ? 'nav-item--active' : ''}`}
                onClick={() => go(item.path)}
                aria-current={currentPage === item.page ? 'page' : undefined}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.page === 'cases' && <em>{activeCount}</em>}
              </button>
            )
          })}
        </nav>

        <div className="sidebar__footer">
          <button className="sidebar-action" onClick={onExportCalendar}>
            <CalendarDays size={17} />
            Export dates
          </button>
          <button
            className="sidebar-action"
            onClick={() => go('/data')}
          >
            <Code2 size={17} />
            Source & license
          </button>
          <p>
            Stored in this browser. Code served at this origin can access the workspace.
          </p>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="sidebar-scrim"
          onClick={() => {
            setMobileOpen(false)
            window.setTimeout(() => mobileMenuRef.current?.focus(), 0)
          }}
          aria-label="Close navigation"
        />
      )}

      <section className="main-panel">
        <header className="topbar">
          <button
            ref={mobileMenuRef}
            className="mobile-menu icon-button"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="primary-sidebar"
          >
            <Menu size={21} />
            <span className="sr-only">Open navigation</span>
          </button>
          <div className="topbar__mobile-logo">
            <Logo />
          </div>
          <div
            className={`global-search ${searchOpen ? 'global-search--open' : ''}`}
            onClick={() => {
              if (window.innerWidth <= 800) {
                setSearchOpen(true)
                window.setTimeout(() => searchRef.current?.focus(), 0)
              }
            }}
          >
            <Search className="global-search__desktop-icon" size={17} />
            <button
              className="mobile-search-trigger"
              type="button"
              aria-label="Open case search"
              aria-expanded={searchOpen}
              aria-controls="global-search-input"
              onClick={() => {
                setSearchOpen(true)
                window.setTimeout(() => searchRef.current?.focus(), 0)
              }}
            >
              <Search size={18} />
            </button>
            <input
              id="global-search-input"
              ref={searchRef}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search cases, people, references…"
              maxLength={200}
              aria-label="Search cases"
              role="combobox"
              aria-expanded={searchOpen && Boolean(search.trim())}
              aria-controls="global-search-results"
            />
            <kbd>/</kbd>
            {searchOpen && search.trim() && (
              <div className="search-results" id="global-search-results">
                {results.length > 0 ? (
                  results.map((snapshot) => (
                    <button
                      key={snapshot.case.id}
                      onClick={() => go(`/case/${snapshot.case.id}`)}
                    >
                      <span
                        className="search-results__dot"
                        style={{ background: snapshot.case.accent }}
                      />
                      <span>
                        <strong>{snapshot.case.title}</strong>
                        <small>{snapshot.case.counterparty}</small>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="search-results__empty">No matching cases.</div>
                )}
              </div>
            )}
          </div>
          <button className="button button--ink topbar__add" onClick={onNewCase}>
            <Plus size={17} />
            New case
          </button>
        </header>
        <main id="main-content" className="page" tabIndex={-1}>
          {children}
        </main>
      </section>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.page}
              className={currentPage === item.page ? 'mobile-nav--active' : ''}
              onClick={() => go(item.path)}
              aria-current={currentPage === item.page ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
        <button onClick={onNewCase}>
          <span className="mobile-nav__plus">
            <Plus size={20} />
          </span>
          <span>New</span>
        </button>
      </nav>
    </div>
  )
}
