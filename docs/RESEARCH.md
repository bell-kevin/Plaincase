# Prior-art and market research

**Snapshot date:** 2026-07-30  
**Purpose:** test Plaincase's novelty language, identify adjacent FLOSS work, verify linked
demos, and compare direct proprietary products.

This is a bounded product/repository review, not a patent search, legal opinion, academic
systematic review, or proof that no similar project exists.

## Conclusion used by the project

The search does **not** support “first FLOSS evidence timeline,” “first local evidence
locker,” or “first promise tracker.” Those categories already have public implementations.

The narrower finding was:

> Within the repositories and products reviewed, we did not find a FLOSS,
> consumer-facing, browser-local application that connected a promise to a source event,
> optional original file, exact excerpt, append-style outcome history, deterministic
> follow-up gaps, and an open case pack containing both the promise ledger and evidence
> fingerprints.

Plaincase therefore describes this as its **innovation target** or **first-known integrated
approach in our bounded search**, never as an established “world first.” New counterexamples
should be added here and the product language corrected.

## Method

The review used combinations of these repository and web concepts:

- `consumer dispute evidence`
- `evidence timeline`
- `evidence locker`
- `case chronology open source`
- `local first evidence`
- `promise ledger`
- `commitment tracker source excerpt`
- `warranty document tracker`
- `home repair dispute tracker`

An exact GitHub repository-name query for `plaincase` returned zero repositories on the
snapshot date. That is only a repository collision check: it is not trademark clearance,
domain availability, npm-name availability, or proof that the word has never been used by
unrelated software. Treat Plaincase as a working project name until the publisher performs
the appropriate name review for their jurisdiction.

For a relevant GitHub result, the review checked:

1. the repository's stated purpose and visible feature documentation;
2. the root license file, not only a README badge or prose claim;
3. the live URL linked by the repository, when present;
4. whether that URL returned HTTP 200 and loaded an application UI;
5. whether the feature overlap reached the complete promise-to-proof chain;
6. whether any privacy, AI, hosting, or planned-versus-live distinction was material.

For proprietary products, pricing was taken from the vendor's own live page. Search-result
snippets, reseller pages, and unsourced comparison blogs were not used for the recorded
price.

HTTP checks used the final HTTPS URL after redirects. “UI loaded” means the public
application shell rendered during the review; it does not certify every workflow,
backend, account path, security claim, or future uptime.

## FLOSS and source-available findings

| Project | Repository/license finding | Repository-linked site check | Relevant overlap | Why it is not the same integrated workflow |
| --- | --- | --- | --- | --- |
| [Evidence Locker](https://github.com/Iceman-Dann/Evidence-Locker) | Root MIT license present | [evidencelocker.vercel.app](https://evidencelocker.vercel.app/) — HTTP 200; UI loaded | Consumer dispute intake, timeline, evidence files, SHA-256, gap analysis, PDF | AI/legal-analysis product; the reviewed feature set did not center a source-linked commitment plus outcome-history ledger. Its own architecture documents sending content to Gemini on explicit analysis actions. |
| [Promise Ledger](https://github.com/Peanuts1605/promise-ledger) | Root MIT license present | [GitHub Pages demo](https://peanuts1605.github.io/promise-ledger/) — HTTP 200; UI loaded | Source-aware commitments, ownership, durable decision trail, reviewable follow-up | Operations/agent-memory proof with a public-safe fixture; repository documentation says the AWS application endpoint was not deployed. It is not a local consumer case/evidence pack. |
| [Promised](https://github.com/TalhaAbid420/promised) | README said MIT, but no root `LICENSE` file was found; treat licensing as unclear until corrected | [Netlify demo](https://promised-app.netlify.app/) — HTTP 200; UI loaded | Local commitment tracking, source excerpts, kept/broken history, JSON portability | No evidence-file manifest, consumer-dispute playbooks, or combined case pack. Optional AI sends text to OpenAI according to its README. |
| [HomeBox](https://github.com/sysadminsmedia/homebox) | Root license present; repository is an established FLOSS home inventory project | [Official demo](https://demo.homebox.software/) — HTTP 200 in the direct availability check; application endpoint was live | Home inventory, documents, warranties, purchases, maintenance | Tracks possessions and warranties rather than dispute events, counterparties, sourced promises, and a review handoff. It also uses a self-hosted server rather than a browser-only static architecture. |

### What this table establishes

- Evidence-file workflows with timelines and hashes already exist.
- Commitment ledgers with source context and outcome states already exist.
- Home-document and warranty tracking already exists.
- The integration—not any one ingredient—is the useful experimental claim.

### What this table does not establish

- that every GitHub repository was indexed or discoverable;
- that repository documentation perfectly matched deployed behavior;
- that a project created after the snapshot date is absent;
- that an unpublicized, non-English, private, archived, or differently named project does
  not implement the same idea;
- legal novelty or patentability.

## Proprietary comparison

| Product | Official live page | Price observed on 2026-07-30 | Relevant scope | Comparison limit |
| --- | --- | --- | --- | --- |
| Evidence Timeline | [Product and pricing page](https://evidencetimeline.com/) — HTTP 200 | Basic free; Premium **US$14.99/month**; page also listed 25,000 non-expiring AI credits for **US$4.99** | Consumer evidence uploads, AI summaries, source-linked chronology, report export | A cloud/AI product with different automation and account capabilities; Plaincase does not reproduce its AI processing. |
| CaseFleet | [Official pricing](https://www.casefleet.com/pricing) — HTTP 200 | Starter began at **US$30/user/month**. The page listed additional storage at **US$10/GB/month** and higher-priced AI/team tiers. | Professional litigation facts, documents, witnesses, chronology, evidence citations, collaboration | Built for legal teams and substantially broader. Plaincase is a single-browser organizer, not legal practice or litigation-management software. |

CaseFleet's page can render different billing choices and plan prices. The durable
comparison claim is the published **starting price**, not a claim that every customer pays
the same amount. Prices exclude any taxes or negotiated enterprise terms and can change
without notice.

## Live-site check log

| URL | Relationship | Result on 2026-07-30 |
| --- | --- | --- |
| <https://evidencelocker.vercel.app/> | Linked from Evidence Locker repository | HTTP 200; application UI loaded |
| <https://peanuts1605.github.io/promise-ledger/> | Linked from Promise Ledger repository | HTTP 200; public-safe interactive UI loaded |
| <https://promised-app.netlify.app/> | Linked from Promised repository metadata | HTTP 200; application UI loaded |
| <https://demo.homebox.software/> | Linked as Demo from HomeBox repository | HTTP 200 in direct availability check; endpoint live |
| <https://evidencetimeline.com/> | Vendor product/pricing site | HTTP 200; product and pricing content loaded |
| <https://www.casefleet.com/pricing> | Vendor pricing page | HTTP 200; pricing content loaded |

These observations should be re-run before a public launch announcement and periodically
thereafter. A failed future link should be marked with a new check date rather than silently
rewriting the historical result.

## Feature comparison

`Yes` means the reviewed documentation or live interface clearly exposed the capability.
`Partial` means a related but materially different capability existed.

| Capability | Plaincase | Evidence Locker | Promise Ledger | Promised | HomeBox |
| --- | :---: | :---: | :---: | :---: | :---: |
| Consumer case workspace | Yes | Yes | No | No | Partial |
| Original evidence files | Yes | Yes | No | No | Partial |
| SHA-256 evidence fingerprint | Yes | Yes | No | No | No |
| Factual event chronology | Yes | Yes | Partial | No | Partial |
| Explicit promise maker/action/due date | Yes | Partial | Yes | Yes | No |
| Promise linked to source event/file/excerpt | Yes | No finding | Partial | Partial | No |
| Status outcome history | Yes | No finding | Yes | Yes | No |
| Evidence and promise ledger in one open pack | Yes | No finding | No | No | No |
| Works without account or paid API | Yes | Partial | Demo only | Yes, heuristic mode | Self-hosted |
| Default case data stays in one browser origin | Yes | Partial | No | Yes | No |

“No finding” is more precise than “No”: the capability was not found in the bounded
review, but could exist outside the inspected documentation or build.

## Reproducibility checklist

When refreshing this research:

1. Record the date, locale, currency, and billing toggle.
2. Repeat the concept queries and add meaningful new candidates.
3. Open the repository's license file directly.
4. Follow the live link from the repository, not a guessed domain.
5. Record final URL, HTTP status, and whether the UI—not merely a host error page—renders.
6. Test only with fictional data.
7. Separate source-visible, documented, demo-only, and verified-live capabilities.
8. Capture exact official pricing text without assuming monthly/annual equivalence.
9. Update both this file and the short table in the root README.
10. Soften or remove the novelty language whenever evidence warrants it.

## Corrections

Prior-art corrections are welcome. Open a public documentation issue with the repository
URL, license URL, live-demo URL, and the exact overlapping workflow. Do not include private
case data. A correction is useful project maintenance, not an adversarial report.
