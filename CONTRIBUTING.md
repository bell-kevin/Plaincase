# Contributing to Plaincase

Thank you for helping build a calmer, inspectable way to organize everyday disputes.
Plaincase welcomes code, tests, accessibility work, documentation, research corrections,
and carefully scoped playbook improvements.

By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before opening an issue

Search existing issues first. For a bug, include:

- expected and actual behavior;
- the smallest reproducible sequence;
- browser name and version, operating system, and whether private browsing was used;
- whether the problem occurs after clearing site data in a disposable test profile;
- console output with tokens, paths, names, references, and other sensitive values removed.

**Never upload a real evidence file, medical document, bill, lease, claim, message, backup,
case pack, or screenshot containing personal information to a public issue.** Reproduce
with invented text and throwaway files.

Security vulnerabilities must follow [SECURITY.md](SECURITY.md).

## Design proposals

Open an issue before implementing a large feature, new data format, schema migration,
playbook category, dependency, or network integration. Describe:

- the user problem and a concrete fictional example;
- why the current workflow cannot solve it;
- privacy and security changes;
- data migration and export compatibility;
- behavior without network access or a paid service;
- effect on Bolt/static-host compatibility;
- tests and documentation needed.

Features that send case data off-device require especially careful review. No contribution
may silently transmit user content.

## Local setup

Requirements:

- Node.js 20.19 or newer
- npm
- a modern browser with IndexedDB and Web Crypto

```bash
npm ci
npm run dev
```

No secret or service environment variables are required. A public build should set the
intentionally public `VITE_SOURCE_URL` to its exact Corresponding Source. Never put a
secret in a `VITE_*` variable; Vite exposes it to browser code.

Run the complete quality gate before submitting:

```bash
npm run check
```

Available commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite on a network-accessible development host |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run build` | Type-check and create the production bundle |
| `npm run preview` | Serve the built bundle for local verification |
| `npm run check` | Lint, test, and build |

## Contribution principles

### Preserve the privacy model

- Default case content remains in origin-scoped IndexedDB.
- No analytics, tracking pixel, advertising SDK, remote font, silent telemetry, or
  background upload.
- Network features must be explicit, optional, documented, and reviewable.
- Do not describe local storage as encryption or hashes as proof.
- Plaintext export risks must remain visible.

### Preserve useful offline behavior

Core capture, review, promise tracking, and export must work without a proprietary model,
paid API, or account. An optional integration must fail closed and leave the local
workspace usable.

### Preserve open handoff

Do not make a proprietary viewer necessary. Prefer versioned JSON, CSV, Markdown,
iCalendar, ZIP, and documented MIME types. A format change needs:

- a version decision;
- backward-compatible import or a migration;
- fixture-based tests;
- updates to the README and architecture document.

### Preserve Bolt compatibility

Plaincase is a single root-level Vite project published as static files. Avoid:

- native Node add-ons;
- mandatory non-JavaScript build tools;
- a required server/database process;
- route handling that depends on host rewrites;
- runtime secrets;
- platform-specific storage APIs.

If a contribution truly needs one of these, the proposal must document a static,
FLOSS-compatible fallback.

### Keep guidance honest

Playbooks organize evidence and communication; they are not jurisdiction-specific legal
advice. Do not add predicted success, invented rights, automatic legal deadlines, or
unsupported claims. Explain deterministic scoring inputs in user-facing language and
cover rule changes with tests.

## Coding guidance

- Keep TypeScript strict and avoid `any` unless there is a documented boundary.
- Prefer small pure functions for derived rules and serialization.
- Use Dexie transactions when related records must change together.
- Treat stored IDs as references, not authorization.
- Make destructive actions explicit and confirm them in the UI.
- Keep keyboard, screen-reader, reduced-motion, contrast, narrow-screen, and touch use in
  mind.
- Match the existing visual system before adding another component abstraction.
- Do not log user content.

## Tests

Add tests in proportion to risk. At minimum:

- deterministic radar/coverage changes need unit tests for boundary dates and missing data;
- export changes need exact-field and escaping fixtures;
- restore/schema changes need valid, invalid, and rollback-path coverage;
- storage changes need transaction and deletion coverage;
- UI changes need keyboard and accessible-name checks where applicable.

Use fictional data that cannot be mistaken for a real person or dispute.

Manual checks for a user-facing change should include:

1. a fresh profile with demo data;
2. an empty workspace;
3. reload/persistence;
4. narrow mobile and desktop widths;
5. keyboard-only operation;
6. the relevant export opened outside Plaincase;
7. a production build served by `npm run preview`.

## Pull requests

Keep a pull request focused. In its description:

- explain the user-facing outcome;
- link the issue or proposal;
- list automated and manual verification;
- call out data/schema/export changes;
- call out privacy, security, accessibility, and Bolt impacts;
- include screenshots only with fictional content;
- update documentation in the same change.

Do not commit `dist/`, `node_modules/`, local environment files, browser profiles, backups,
case packs, or real user data.

## Licensing contributions

Plaincase is licensed under the GNU Affero General Public License, version 3 or (at your
option) any later version. By submitting a contribution, you agree that it may be
distributed under that license and that you have the right to submit it.

Do not copy code, text, icons, or playbook content from a source whose license is
incompatible or unknown. Preserve third-party notices when required and mention new
dependencies in the pull request. Update [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
and include any required license or attribution text whenever the dependency tree changes.
