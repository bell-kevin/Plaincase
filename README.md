<a name="readme-top"></a>

# Plaincase

**A private, local-first workspace for turning everyday disputes into a clear paper trail.**

Plaincase helps a person organize a repair that keeps stalling, a damaged purchase, an
insurance claim, contractor work, a medical bill, or another unresolved matter. It keeps
the facts, original files, dates, next steps, and other people's promises together—then
exports an ordinary case pack that a new reader can understand without a Plaincase
account.

There is no Plaincase backend, account, analytics service, AI service, or paid API. The
published site is a static React application. Case data and evidence files stay in the
current browser profile's IndexedDB unless the user explicitly downloads an export.

> **Important:** Plaincase is an organizational tool. It does not authenticate evidence,
> determine admissibility, predict outcomes, calculate legal deadlines, or provide legal
> advice. Preserve original files and seek qualified help when the stakes call for it.

## The idea

Most dispute tools stop at a document folder or a chronology. Plaincase adds a
**promise-to-proof chain**:

1. Record an event such as a call, message, meeting, payment, incident, or deadline.
2. Pull out the exact commitment: who promised what, and by when.
3. Link that commitment to its source event, an optional supporting file, and an exact
   excerpt.
4. Mark it open, kept, or missed. The normal status workflow appends an outcome entry and
   adds a factual event to the case timeline.
5. Export the chronology, source-linked promise ledger, evidence manifest, SHA-256
   fingerprints, and original files together.

That is the project's innovation target. It is **not** a claim that Plaincase invented
evidence timelines, local browser storage, file hashing, or promise tracking. A dated,
bounded GitHub review found FLOSS projects that implement several of those ideas
separately. We did not find one that combined this particular consumer-facing chain with
local-only storage and an open case pack. “Did not find” is not proof of global or
permanent uniqueness; see [the research log](docs/RESEARCH.md).

## What works today

- Separate cases with status, stage, counterparty, reference, amount, target date, desired
  resolution, and factual summary
- Guided playbooks for home repair, purchase/service problems, insurance claims,
  contractor disagreements, medical bills, and a flexible general record
- Chronological event log for notes, messages, calls, meetings, payments, incidents, and
  deadlines
- Original evidence-file storage (up to 50 MB per file in the current UI) in IndexedDB
  with category, relevance note, occurrence date, size, MIME type, and a
  browser-computed SHA-256 fingerprint
- A source-linked promise ledger with maker, action, due date, excerpt, file/event
  references, status, and status history
- User-chosen next steps and due dates
- Deterministic “attention radar” for overdue or near-term promises, target dates, missing
  playbook evidence, calls without written follow-up, and open tasks
- A transparent record-coverage score based on visible playbook prompts and case activity
- Search and status filtering
- One-case ZIP export with a Markdown brief, CSV chronology, CSV promise ledger, JSON
  integrity manifest, and original evidence files
- Full-workspace JSON backup and restore
- Calendar export in iCalendar (`.ics`) format
- Responsive desktop and mobile layouts
- Fictional demo cases on first use, clearly identified as sample data
- A generated, live-linked bundle of runtime dependency license and NOTICE texts

Plaincase deliberately has no legal “strength” score, jurisdiction-specific rights
engine, automatic demand letter, background upload, or AI-generated conclusion.

## Privacy and security, without euphemisms

“Local-first” is a data-flow property, not a complete security system.

- **No application server:** Plaincase has no endpoint to receive case data. All current
  application writes go to IndexedDB for the site's origin.
- **Not separately encrypted:** data is readable to JavaScript running on the same origin
  and to someone who can access the unlocked browser profile. Use device login protection
  and full-disk encryption.
- **The host still sees normal web traffic:** Bolt (or another static host) can receive IP
  addresses and ordinary request metadata when somebody loads the app, even though case
  content is not uploaded by Plaincase.
- **The delivered code is part of the trust boundary:** a compromised deployment, hostile
  browser extension, supply-chain compromise, or cross-site scripting flaw could read
  local data while the site is open.
- **Browser storage is not durable backup:** site data may be cleared by the user, browser,
  private-browsing rules, quota pressure, or device management. Export a workspace backup
  after meaningful changes.
- **There is no cross-device sync:** another browser, browser profile, hostname, or device
  has a separate workspace. Move data deliberately with an exported backup.
- **Exports are plaintext:** backup JSON, calendar files, and case-pack ZIPs are not
  encrypted. Store and share them accordingly.
- **SHA-256 is only an integrity fingerprint:** it can help compare bytes. It is not a
  trusted timestamp, signature, proof of authorship, notarization, or legal chain of
  custody.
- **Restore validates structure, not authorship:** it rejects files over 250 MB, enforces
  bounded collection sizes, validates IDs, live references, field types/lengths, enums, dates,
  and file metadata, then decodes and re-hashes every evidence blob. A failure aborts
  before replacement. These checks still cannot prove who created an internally consistent
  backup or whether its claims are true. Import only a backup you trust and export the
  current workspace first.
- **Removed linked files leave a tombstone:** deleting evidence that supports a promise
  transactionally removes the bytes while retaining the former filename, ID, SHA-256, and
  removal time in that promise. A backup can therefore enforce live-reference integrity
  without silently erasing the historical link.
- **Deletion is not forensic erasure:** removing data from IndexedDB does not erase copies
  in downloaded backups, recipient systems, device backups, caches, or recoverable storage.

Read [SECURITY.md](SECURITY.md) before using real sensitive material and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the trust boundaries.

## Run locally

Requirements:

- Node.js 20.19 or newer
- npm (the lockfile is committed)
- A modern browser with IndexedDB and the Web Crypto API

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. The application itself needs no secret or service
configuration. For a public deployment, copy `.env.example` to `.env` and replace
`VITE_SOURCE_URL` with the exact public repository, release, or commit containing the
deployed source. This value is intentionally public.

Quality gates:

```bash
npm run check
```

Or run them separately:

```bash
npm run lint
npm run test
npm run build
npm run preview
```

`npm run build` writes the static production bundle to `dist/`.

## Publish with Bolt.new

Plaincase is intentionally shaped for Bolt:

- one Vite + React + TypeScript project at the repository root;
- a committed npm lockfile;
- browser-native IndexedDB and Web Crypto;
- hash-based routes such as `#/desk`, so a static host does not need SPA rewrite rules;
- no backend, database service, environment secret, native Node add-on, service worker, or
  paid runtime API.

Bolt's current documentation says it supports browser-native JavaScript frameworks and
Node.js tooling. Plaincase uses Node only to build the static client. See
[Bolt supported technologies](https://support.bolt.new/concepts/supported-technologies).

### Import and verify

1. Push the complete repository to GitHub. Keep `package.json`, `package-lock.json`,
   `index.html`, `vite.config.ts`, `src/`, and `public/` at the repository root.
2. From the [Bolt homepage](https://bolt.new), choose **GitHub**, authorize only the
   repositories Bolt needs, select this repository (or choose **Import from URL**), and
   click **Choose this repository**. These are the current official
   [GitHub import steps](https://support.bolt.new/integrations/git#import-an-existing-repository).
3. Set `VITE_SOURCE_URL` in Bolt to the exact public repository, release, or commit that
   contains this deployment's Corresponding Source. This value is public, not a secret.
4. Let Bolt install dependencies. If it needs an explicit command, use `npm ci`.
5. Confirm the preview starts with `npm run dev`.
6. In Bolt's terminal, run `npm run check`.
7. In the preview, exercise at least these flows:
   - open a fictional demo case;
   - add and download a small test evidence file;
   - record and update a promise;
   - build a case pack;
   - export a backup, restore it, and reload the page;
   - open a copied hash route directly.

Do not add secrets to `VITE_*` variables. Vite embeds those values into browser code.
Set `VITE_SOURCE_URL` to the public Corresponding Source URL before the production build;
it powers the visible source link in **Data & privacy**.

### Publish and update

1. Open Bolt's **Publish** menu.
2. Choose public visibility and click **Publish**.
3. Open the generated `bolt.host` URL in a fresh browser profile and repeat a short
   create/reload/export check.
4. After later changes, use **Publish → Update**. Repository changes are not automatically
   sent to the live site.

Before the first public release, verify that **Data & privacy → View corresponding source**
opens the exact public source selected by `VITE_SOURCE_URL`. A network deployment of a
modified AGPL work must give remote users a practical way to obtain that deployment's
Corresponding Source. Do not publish with a guessed, private, or placeholder URL.

Bolt documents this flow in
[Publish your project to a live website](https://support.bolt.new/cloud/hosting/publish).
It recommends using the Publish/Update controls rather than asking the agent to publish,
because those controls do not consume tokens.

### Bolt limits to know

As checked on **2026-07-30**, [Bolt Cloud hosting plans](https://support.bolt.new/cloud/hosting/plans)
listed these account-wide monthly allowances:

| Plan | Included bandwidth | Included requests | Important behavior |
| --- | ---: | ---: | --- |
| Free | 10 GB | 333,333 | Hard traffic limit; sites pause until the allowance resets |
| Pro | 30 GB | 1,000,000 | Pay-as-you-go capacity can be configured |

The limits are shared by all sites on the Bolt account. Plaincase's application bundle is
static, and evidence files never consume hosting bandwidth because they are not uploaded.
Do not interpret that as unlimited local storage: IndexedDB quota is browser- and
device-dependent.

Bolt and StackBlitz also document
[WebContainer constraints](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers)
and [project configuration](https://developer.stackblitz.com/platform/webcontainers/project-config).
Plaincase avoids the usual incompatibilities by requiring no native binary, privileged
process, or non-JavaScript backend.

## Architecture

```text
static files from host
          │
          ▼
 React UI + hash router
          │
          ├── Dexie ──► origin-scoped IndexedDB
          │              cases · events · evidence blobs · promises · tasks
          │
          ├── Web Crypto ──► SHA-256 file fingerprints
          │
          └── local export code
                         ├── case-pack ZIP
                         ├── workspace JSON backup
                         └── iCalendar file
```

The UI subscribes to Dexie queries, assembles each case into a snapshot, derives the radar
and coverage score with deterministic functions, and builds exports entirely in the
browser. There is no server-side render path and no network persistence layer.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the components, data model, decisions,
and trust boundaries.

## Data and export formats

### Workspace backup

`plaincase-backup-YYYY-MM-DD.json` is a UTF-8 JSON document with:

```json
{
  "format": "plaincase-backup",
  "version": 1,
  "exportedAt": "ISO-8601 timestamp",
  "cases": [],
  "events": [],
  "evidence": [
    {
      "blob fields": "metadata omitted here",
      "dataUrl": "data:<mime>;base64,..."
    }
  ],
  "commitments": [],
  "tasks": []
}
```

Evidence bytes are embedded as data URLs. This makes the backup portable but larger than
the original files and still unencrypted. Restore accepts a backup file up to 250 MB,
validates the bounded record graph and field shapes, recomputes evidence hashes, and
replaces all five data tables in the current origin only after those checks succeed.

### Case pack

`<case-name>-case-pack.zip` contains:

```text
<case-name>/
├── README.txt
├── case-brief.md
├── timeline.csv
├── promise-ledger.csv
├── integrity-manifest.json
└── evidence/
    ├── 01-original-name.ext
    └── ...
```

- `case-brief.md` is the human-readable matter, desired resolution, chronology, promise
  ledger, and evidence manifest.
- `timeline.csv` columns are
  `date,type,title,actor,channel,commitment_id,detail`.
- `promise-ledger.csv` includes the maker, promise, due date, status, source-event ID/date/title,
  source-file ID/name/SHA-256, whether that file is available or removed, removal time,
  excerpt, and serialized status history.
- `integrity-manifest.json` uses format `plaincase-integrity-manifest`, version `1`, and
  identifies SHA-256 as the hash algorithm.
- `evidence/` contains the stored original bytes under numbered, sanitized filenames.

### Calendar

`plaincase-dates.ics` includes target dates, open promise due dates, and open tasks with
due dates from active or waiting cases. Resolved and archived cases are omitted. Calendar
date-only values are emitted as all-day events; timestamp values retain their UTC form.
Import creates another copy of those descriptions; review the file before importing it
into a cloud calendar.

These formats are deliberately ordinary and documented so recipients do not need
Plaincase. Compatibility promises apply only to the currently documented version; future
schema changes must include a migration or a new version number.

## FLOSS stack

Plaincase itself is licensed under
[GNU AGPL v3 or later](LICENSE). Its runtime is browser-native, and its direct application
dependencies are FLOSS:

| Role | Project |
| --- | --- |
| UI | [React](https://github.com/facebook/react) |
| Local database wrapper | [Dexie.js](https://github.com/dexie/Dexie.js) |
| ZIP generation | [JSZip](https://github.com/Stuk/jszip) |
| Date utilities | [date-fns](https://github.com/date-fns/date-fns) |
| Icons | [Lucide](https://github.com/lucide-icons/lucide) |
| Fonts | [Fontsource](https://github.com/fontsource/fontsource) packages for Manrope and Newsreader |
| Build and tests | [Vite](https://github.com/vitejs/vite), [TypeScript](https://github.com/microsoft/TypeScript), [Vitest](https://github.com/vitest-dev/vitest), and [ESLint](https://github.com/eslint/eslint) |

Exact versions and transitive dependencies are pinned in `package-lock.json`. Run your own
license and vulnerability review before redistributing a build; this table is an
architecture summary, not legal advice. Bolt hosting is an external service, not a runtime
dependency: the same `dist/` output can be served from any competent static host.
See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the audited direct dependency
licenses and installed-tree license inventory.

## How Plaincase compares

The closest products found in the dated review overlap, but do not make Plaincase a drop-in
replacement:

| Project/product | What it demonstrates | Difference from Plaincase |
| --- | --- | --- |
| [Evidence Locker](https://github.com/Iceman-Dann/Evidence-Locker) ([live](https://evidencelocker.vercel.app/)) | MIT-licensed consumer evidence workflow with a timeline, SHA-256, proof gaps, and PDF output | Uses AI/legal framing; the reviewed build did not center a source-linked promise/outcome ledger |
| [Promise Ledger](https://github.com/Peanuts1605/promise-ledger) ([live](https://peanuts1605.github.io/promise-ledger/)) | MIT-licensed commitments, source, owner decisions, and review trail | Operations/agent-memory proof rather than a local consumer evidence workspace and portable case pack |
| [Promised](https://github.com/TalhaAbid420/promised) ([live](https://promised-app.netlify.app/)) | Local commitment extraction and tracking | No evidence-case workflow; its README said MIT, but no root license file was present when checked |
| [HomeBox](https://github.com/sysadminsmedia/homebox) ([demo](https://demo.homebox.software/)) | AGPL home inventory with documents, warranties, purchases, and maintenance | Inventory and warranty management, not dispute chronology or promise-to-proof tracking |
| [Evidence Timeline](https://evidencetimeline.com/) | Proprietary evidence workspace and timeline aimed at consumers | Cloud account and AI-credit model; Premium was listed at **US$14.99/month** |
| [CaseFleet](https://www.casefleet.com/pricing) | Proprietary litigation chronology, documents, facts, and evidence citations for legal teams | Professional cloud platform; Starter began at **US$30/user/month**, with storage charges listed at **US$10/GB/month** |

Repository-linked demos in this table were checked on 2026-07-30 and returned HTTP 200;
the review also confirmed that their application UI loaded. A live check is a point-in-time
observation, not an uptime guarantee. Prices can change—follow the linked official pricing
page before making a purchasing decision. Full methodology and caveats are in
[docs/RESEARCH.md](docs/RESEARCH.md).

## Project principles

- **Facts before conclusions.** The software should make provenance visible and avoid
  pretending to make legal judgments.
- **Local unless explicitly exported.** A feature must not quietly create a new data path.
- **Open handoff.** A recipient should not need an account, subscription, or proprietary
  viewer.
- **No fake integrity claims.** Hashes are useful; they are not signatures or timestamps.
- **Useful without AI.** Core organization must remain deterministic, inspectable, and
  available without a model provider.
- **Calm over coercive.** No fear-based copy, outcome prediction, or dark patterns.
- **Portable and host-agnostic.** Static deployment and open formats keep the project easy
  to publish, fork, archive, and move.

## Contributing

Bug reports, accessibility improvements, new tests, careful playbook refinements, export
compatibility work, and privacy-preserving features are welcome. Never attach a real
dispute file or personal information to a public issue.

Read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request. Security issues belong
in the private channel described in [SECURITY.md](SECURITY.md), not a public issue.

## License

Plaincase is free software licensed under the
[GNU Affero General Public License, version 3 or (at your option) any later version](LICENSE).
Contributions are accepted under the same license.

<p align="right"><a href="#readme-top">back to top</a></p>
