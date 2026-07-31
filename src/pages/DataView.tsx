import { ArchiveRestore, CalendarDays, Check, Code as Code2, Database, Download, ExternalLink, FileKey as FileKey2, FingerprintPattern as Fingerprint, HardDrive, RefreshCcw, ShieldCheck, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { clearAllData, resetDemoData } from '../lib/db'
import { sourceUrl } from '../lib/config'
import { BackupError, exportBackup, exportCalendar, restoreBackup } from '../lib/export'
import { formatBytes } from '../lib/utils'
import type { CaseSnapshot } from '../types'

interface DataViewProps {
  snapshots: CaseSnapshot[]
  onToast: (message: string) => void
}

export function DataView({ snapshots, onToast }: DataViewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null)
  const [persistent, setPersistent] = useState<boolean | null>(null)
  const evidenceSize = snapshots.reduce(
    (sum, snapshot) =>
      sum + snapshot.evidence.reduce((caseSum, evidence) => caseSum + evidence.size, 0),
    0,
  )

  useEffect(() => {
    navigator.storage
      ?.estimate()
      .then((estimate) => {
        setUsage({ used: estimate.usage ?? evidenceSize, quota: estimate.quota ?? 0 })
      })
      .catch(() => setUsage(null))
    navigator.storage
      ?.persisted?.()
      .then(setPersistent)
      .catch(() => setPersistent(null))
  }, [evidenceSize, snapshots])

  async function importFile(file?: File) {
    if (!file) return
    const confirmed = window.confirm(
      'Restoring replaces the current workspace on this device. Continue?',
    )
    if (!confirmed) return
    try {
      await restoreBackup(file)
      onToast('Backup restored on this device.')
    } catch (error) {
      console.error(error)
      onToast(
        error instanceof BackupError ? error.message : 'The backup could not be restored.',
      )
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <section className="page-heading">
        <div>
          <span className="eyebrow">Your data, literally</span>
          <h1>
            Know what you trust.
            <br />
            <em>Keep it small.</em>
          </h1>
        </div>
        <p>
          Plaincase has no account system, analytics endpoint, ad network, or remote database.
          Your host, domain, browser, and the code served on each visit remain part of the trust
          boundary.
        </p>
      </section>

      <section className="privacy-diagram" aria-label="How data stays on this device">
        <article>
          <span>
            <Upload size={23} />
          </span>
          <strong>You add a file</strong>
          <small>Directly in your browser</small>
        </article>
        <i />
        <article>
          <span>
            <Fingerprint size={23} />
          </span>
          <strong>SHA-256 is calculated</strong>
          <small>Using the browser's Web Crypto API</small>
        </article>
        <i />
        <article>
          <span>
            <HardDrive size={23} />
          </span>
          <strong>IndexedDB stores it</strong>
          <small>On this browser profile</small>
        </article>
        <i className="privacy-diagram__blocked" />
        <article className="privacy-diagram__nowhere">
          <span>
            <ShieldCheck size={23} />
          </span>
          <strong>No Plaincase server</strong>
          <small>The app does not send case content by design</small>
        </article>
      </section>

      <section className="data-grid">
        <article className="data-card data-card--primary">
          <div className="data-card__icon">
            <Database size={23} />
          </div>
          <span className="eyebrow">Portable workspace</span>
          <h2>Back up before the browser decides for you.</h2>
          <p>
            Browser storage can be cleared by you, the browser, device management, or private
            browsing rules. Export a backup after meaningful changes.
          </p>
          <div className="storage-meter">
            <div>
              <span>
                {usage ? formatBytes(usage.used) : formatBytes(evidenceSize)} used by this origin
              </span>
              <span>{usage?.quota ? `${formatBytes(usage.quota)} allowance` : 'Quota varies'}</span>
            </div>
            <progress
              value={usage?.quota ? usage.used / usage.quota : Math.min(evidenceSize / 50_000_000, 1)}
              max="1"
            />
          </div>
          <div className="data-card__actions">
            <button
              className="button button--ink"
              onClick={async () => {
                await exportBackup()
                onToast('Portable backup exported.')
              }}
            >
              <Download size={17} />
              Export backup
            </button>
            <button className="button button--ghost" onClick={() => inputRef.current?.click()}>
              <ArchiveRestore size={17} />
              Restore
            </button>
            {persistent !== true && navigator.storage?.persist && (
              <button
                className="button button--ghost"
                onClick={async () => {
                  const granted = await navigator.storage.persist()
                  setPersistent(granted)
                  onToast(
                    granted
                      ? 'The browser granted persistent storage.'
                      : 'The browser kept its standard storage eviction rules.',
                  )
                }}
              >
                <HardDrive size={17} />
                Request durable storage
              </button>
            )}
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept="application/json,.json"
              onChange={(event) => importFile(event.target.files?.[0])}
            />
          </div>
        </article>

        <article className="data-card">
          <div className="data-card__icon data-card__icon--lime">
            <CalendarDays size={23} />
          </div>
          <span className="eyebrow">Open format</span>
          <h2>Put dates on any calendar.</h2>
          <p>
            Export target dates, next steps, and open promises as a standard ICS file. Nothing
            needs ongoing calendar access.
          </p>
          <button
            className="button button--outline"
            onClick={() => {
              exportCalendar(snapshots)
              onToast('Calendar file exported.')
            }}
          >
            Export .ics <Download size={16} />
          </button>
        </article>
      </section>

      <section className="security-facts">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Security model</span>
            <h2>Know the boundaries</h2>
          </div>
        </div>
        <div className="fact-grid">
          <article>
            <FileKey2 size={21} />
            <h3>Local is not encrypted</h3>
            <p>
              Plaincase relies on your device login, browser profile, and full-disk encryption. It
              does not add a second password layer.
            </p>
          </article>
          <article>
            <Fingerprint size={21} />
            <h3>A fingerprint is not notarization</h3>
            <p>
              SHA-256 can detect changed bytes. It does not establish authorship, capture time, or
              legal chain of custody.
            </p>
          </article>
          <article>
            <ShieldCheck size={21} />
            <h3>Exports are plaintext</h3>
            <p>
              Backups and case packs include sensitive records and original files. Downloads may
              sync to a cloud account; review where your browser saves them.
            </p>
          </article>
          <article>
            <Code2 size={21} />
            <h3>Served code can read this origin</h3>
            <p>
              A future deployment on the same origin can access its IndexedDB. Trust the host,
              domain, DNS, and exact source delivered each time you open the app.
            </p>
          </article>
        </div>
      </section>

      <section className="license-card">
        <div>
          <span className="eyebrow">FLOSS all the way down</span>
          <h2>GNU Affero General Public License v3.0</h2>
           <p>
             Read, run, audit, modify, and self-host the whole app. If someone offers a modified
             version over a network, AGPLv3 preserves users' right to receive that source.
           </p>
           <div className="license-card__links">
             {sourceUrl ? (
               <a className="button button--lime" href={sourceUrl} target="_blank" rel="noreferrer">
                 View corresponding source <ExternalLink size={15} />
               </a>
             ) : (
               <span className="source-link-needed">
                 Publisher: set <code>VITE_SOURCE_URL</code> to the exact public source before
                 launch.
               </span>
             )}
             <a
               className="license-text-link"
               href="https://www.gnu.org/licenses/agpl-3.0.html"
               target="_blank"
               rel="noreferrer"
             >
               Read the license <ExternalLink size={13} />
             </a>
             <a
               className="license-text-link"
               href="./third-party-licenses.txt"
               target="_blank"
               rel="noreferrer"
             >
               Third-party licenses <ExternalLink size={13} />
             </a>
           </div>
          <div className="license-card__checks">
            <span>
              <Check size={14} /> No proprietary backend
            </span>
            <span>
              <Check size={14} /> No paid API
            </span>
            <span>
              <Check size={14} /> Open export formats
            </span>
          </div>
        </div>
        <strong>AGPL<br />v3+</strong>
      </section>

      <section className="danger-zone">
        <div>
          <span className="eyebrow">Local workspace controls</span>
          <h2>Reset or clear this browser</h2>
          <p>These actions affect only Plaincase data stored in this browser profile.</p>
        </div>
        <div>
          <button
            className="button button--ghost"
            onClick={async () => {
              if (!window.confirm('Replace this workspace with the fictional demo cases?')) return
              await resetDemoData()
              onToast('Demo workspace restored.')
            }}
          >
            <RefreshCcw size={16} /> Restore demo
          </button>
          <button
            className="button button--danger"
            onClick={async () => {
              if (
                !window.confirm(
                  'Delete all cases and files from this browser? Export a backup first if needed.',
                )
              )
                return
              await clearAllData()
              onToast('Local workspace cleared.')
            }}
          >
            <Trash2 size={16} /> Clear local data
          </button>
        </div>
      </section>
    </div>
  )
}
