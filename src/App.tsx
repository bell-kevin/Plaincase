import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Layout, type AppRoute } from './components/Layout'
import { NewCaseModal } from './components/NewCaseModal'
import { Toast } from './components/Toast'
import { CaseView } from './pages/CaseView'
import { CasesView } from './pages/CasesView'
import { Dashboard } from './pages/Dashboard'
import { DataView } from './pages/DataView'
import { PlaybooksView } from './pages/PlaybooksView'
import { db, getSnapshot, initializeDatabase } from './lib/db'
import { exportCalendar } from './lib/export'

function readRoute(): AppRoute {
  const path = window.location.hash.replace(/^#/, '') || '/desk'
  const match = path.match(/^\/case\/([^/]+)/)
  if (match?.[1]) {
    try {
      return { page: 'case', id: decodeURIComponent(match[1]) }
    } catch {
      return { page: 'cases' }
    }
  }
  if (path.startsWith('/cases')) return { page: 'cases' }
  if (path.startsWith('/playbooks')) return { page: 'playbooks' }
  if (path.startsWith('/data')) return { page: 'data' }
  return { page: 'desk' }
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [initError, setInitError] = useState('')
  const [route, setRoute] = useState<AppRoute>(readRoute)
  const [newCaseOpen, setNewCaseOpen] = useState(false)
  const [newCasePlaybook, setNewCasePlaybook] = useState('home-repair')
  const [toast, setToast] = useState('')

  useEffect(() => {
    initializeDatabase()
      .then(() => setReady(true))
      .catch((error) => {
        console.error(error)
        setInitError('Plaincase could not open its local database in this browser.')
      })
  }, [])

  useEffect(() => {
    const updateRoute = () => setRoute(readRoute())
    window.addEventListener('hashchange', updateRoute)
    if (!window.location.hash) window.location.hash = '/desk'
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  const snapshots = useLiveQuery(
    async () => {
      if (!ready) return []
      const cases = await db.cases.orderBy('updatedAt').reverse().toArray()
      return await Promise.all(cases.map(getSnapshot))
    },
    [ready],
    [],
  )

  const navigate = useCallback((path: string) => {
    window.location.hash = path
  }, [])

  const openNewCase = useCallback((playbookId = 'home-repair') => {
    setNewCasePlaybook(playbookId)
    setNewCaseOpen(true)
  }, [])

  const selected = useMemo(
    () => (route.page === 'case' ? snapshots.find((item) => item.case.id === route.id) : undefined),
    [route, snapshots],
  )

  if (initError) {
    return (
      <div className="boot-screen boot-screen--error">
        <span>Local workspace unavailable</span>
        <h1>Plaincase could not open this browser’s private database.</h1>
        <p>{initError}</p>
        <p>Try a normal browsing window with site storage enabled, then reload.</p>
        <button className="button button--ink" onClick={() => window.location.reload()}>
          Reload Plaincase
        </button>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="boot-screen">
        <div className="boot-screen__mark">
          <i />
          <i />
          <i />
        </div>
        <p>Opening your private workspace…</p>
      </div>
    )
  }

  let page: React.ReactNode
  if (route.page === 'cases') {
    page = (
      <CasesView
        snapshots={snapshots}
        onNavigate={navigate}
        onNewCase={openNewCase}
      />
    )
  } else if (route.page === 'case') {
    page = selected ? (
      <CaseView snapshot={selected} onNavigate={navigate} onToast={setToast} />
    ) : (
      <div className="empty-state">
        <span>404</span>
        <h1>That case is not on this device.</h1>
        <p>It may have been removed, or this link belongs to a different browser.</p>
        <button className="button button--ink" onClick={() => navigate('/cases')}>
          View cases
        </button>
      </div>
    )
  } else if (route.page === 'playbooks') {
    page = <PlaybooksView onNewCase={openNewCase} />
  } else if (route.page === 'data') {
    page = <DataView snapshots={snapshots} onToast={setToast} />
  } else {
    page = (
      <Dashboard
        snapshots={snapshots}
        onNavigate={navigate}
        onNewCase={openNewCase}
      />
    )
  }

  return (
    <>
      <Layout
        route={route}
        snapshots={snapshots}
        onNavigate={navigate}
        onNewCase={() => openNewCase()}
        onExportCalendar={() => {
          exportCalendar(snapshots)
          setToast('Calendar file exported.')
        }}
      >
        {page}
      </Layout>
      <NewCaseModal
        open={newCaseOpen}
        initialPlaybookId={newCasePlaybook}
        onClose={() => setNewCaseOpen(false)}
        onCreated={(caseId) => {
          setNewCaseOpen(false)
          setToast('Case created on this device.')
          navigate(`/case/${caseId}`)
        }}
      />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  )
}
