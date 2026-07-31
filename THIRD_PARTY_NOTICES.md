# Third-party software notices

Plaincase is licensed under AGPL-3.0-or-later. It also builds on third-party free and open
source software under compatible licenses.

This inventory was generated from the installed npm tree and committed lockfile on
**2026-07-30**. It is provided for transparency and attribution; it is not legal advice or
a substitute for a release-specific license review.

## Direct runtime dependencies

| Package | Pinned version | Declared license | Upstream |
| --- | ---: | --- | --- |
| `@fontsource-variable/manrope` | 5.3.0 | OFL-1.1 | [Fontsource](https://github.com/fontsource/fontsource) |
| `@fontsource-variable/newsreader` | 5.3.0 | OFL-1.1 | [Fontsource](https://github.com/fontsource/fontsource) |
| `date-fns` | 4.4.0 | MIT | [date-fns](https://github.com/date-fns/date-fns) |
| `dexie` | 4.4.4 | Apache-2.0 | [Dexie.js](https://github.com/dexie/Dexie.js) |
| `dexie-react-hooks` | 4.4.4 | Apache-2.0 | [Dexie.js](https://github.com/dexie/Dexie.js) |
| `jszip` | 3.10.1 | MIT OR GPL-3.0-or-later | [JSZip](https://github.com/Stuk/jszip) |
| `lucide-react` | 1.28.0 | ISC | [Lucide](https://github.com/lucide-icons/lucide) |
| `react` | 19.2.8 | MIT | [React](https://github.com/facebook/react) |
| `react-dom` | 19.2.8 | MIT | [React](https://github.com/facebook/react) |

Font files from the two Fontsource variable packages are bundled into the static
production output. Their packages declare the SIL Open Font License 1.1.

## Direct development dependencies

| Package | Pinned version | Declared license |
| --- | ---: | --- |
| `@eslint/js` | 10.0.1 | MIT |
| `@testing-library/jest-dom` | 6.9.1 | MIT |
| `@testing-library/react` | 16.3.2 | MIT |
| `@types/node` | 22.20.1 | MIT |
| `@types/react` | 19.2.18 | MIT |
| `@types/react-dom` | 19.2.3 | MIT |
| `@vitejs/plugin-react` | 5.2.0 | MIT |
| `eslint` | 10.8.0 | MIT |
| `eslint-plugin-react-hooks` | 7.1.1 | MIT |
| `eslint-plugin-react-refresh` | 0.5.3 | MIT |
| `globals` | 17.5.0 | MIT |
| `jsdom` | 28.0.0 | MIT |
| `playwright-core` | 1.62.1 | Apache-2.0 |
| `typescript` | 5.9.3 | Apache-2.0 |
| `typescript-eslint` | 8.65.0 | MIT |
| `vite` | 7.3.6 | MIT |
| `vitest` | 4.1.10 | MIT |

## Installed-tree license inventory

The audit found 265 unique third-party name/version records and no package with a missing
`license` field in npm's installed metadata.

| SPDX expression reported by package | Unique package/version records |
| --- | ---: |
| MIT | 210 |
| Apache-2.0 | 20 |
| ISC | 14 |
| BSD-2-Clause | 8 |
| BSD-3-Clause | 3 |
| BlueOak-1.0.0 | 2 |
| MIT-0 | 2 |
| OFL-1.1 | 2 |
| MIT AND Zlib | 1 |
| MIT OR GPL-3.0-or-later | 1 |
| CC-BY-4.0 | 1 |
| CC0-1.0 | 1 |

This is a count of installed name/version records, not package popularity, lines of code,
or what necessarily appears in a tree-shaken production bundle.

## Reproduce the inventory

Install exactly from the lockfile:

```bash
npm ci
```

Inspect direct dependencies:

```powershell
npm query ':root > *' |
  ConvertFrom-Json |
  Select-Object name, version, license |
  Sort-Object name
```

Inspect all unique installed package/version/license records:

```powershell
npm query '*' |
  ConvertFrom-Json |
  Where-Object { $_.name -and $_.version -and $_.name -ne 'plaincase' } |
  Select-Object name, version, license -Unique |
  Sort-Object name, version
```

On another shell, use the same `npm query` selectors and process the returned JSON with
your preferred JSON tool.

## Redistribution

The canonical license text for each installed package is available in that package's
directory under `node_modules` after `npm ci`; common filenames include `LICENSE`,
`LICENSE.md`, and `LICENSE.txt`. Source repositories are also recorded in package metadata
and the lockfile.

Before distributing source or a production bundle:

1. rebuild this inventory from the exact release lockfile;
2. inspect packages with changed names, versions, licenses, or upstreams;
3. retain copyright, license, attribution, and NOTICE material required by each dependency;
4. include source and license access appropriate to the distribution method;
5. verify that the public deployment offers its exact Corresponding Source as required by
   AGPL section 13.

The Vite release build also emits `third-party-licenses.txt` into `dist/` from the license
and NOTICE files of every package in the runtime dependency closure. The live
**Data & privacy** page links to that bundled text. The build fails if a listed runtime
package has no discoverable license material; update the runtime list in `vite.config.ts`
whenever the production dependency tree changes.

Package metadata can be incorrect. If this file disagrees with an included license file,
the actual license text and qualified legal interpretation control.
