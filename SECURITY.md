# Security policy

Plaincase stores potentially sensitive case records and original files in a browser. Treat
security and privacy defects as high-impact even though the project has no application
backend.

## Supported versions

Until tagged stable releases exist, only the latest commit on the default branch is
supported with security fixes. Once releases are published, this table should be updated
to name the supported release lines.

| Version | Supported |
| --- | :---: |
| Default branch | Yes |
| Older commits, forks, and modified deployments | No |

Fork maintainers and deployment operators are responsible for their delivered source,
dependencies, headers, origin, and incident response.

## Report a vulnerability privately

Use **Report a vulnerability** on the repository's GitHub **Security** tab. This opens a
private vulnerability report when private reporting is enabled.

If that control is not present, do not publish exploit details or sensitive data. Contact
the project owner privately through the address listed on their GitHub profile and ask for
a private reporting channel. A public issue may say only that you need security contact;
it must not contain the vulnerability details.

Include:

- affected commit or release;
- browser and operating system;
- impact and realistic attack preconditions;
- minimal reproduction using invented data;
- whether a malicious file, dependency, same-origin script, extension, or deployment
  change is required;
- suggested remediation, if known.

Do not send real case content, evidence, backups, tokens, credentials, or third-party
personal information. Plaincase has no bug bounty and cannot promise compensation.

## Response goals

Maintainers should aim to:

- acknowledge a complete report within 7 days;
- provide an initial severity assessment within 14 days;
- coordinate a fix and disclosure timeline appropriate to the risk;
- credit the reporter if requested and safe.

These are best-effort goals for a volunteer project, not a service-level agreement. Please
allow a reasonable remediation window before public disclosure. Maintainers may request a
GitHub Security Advisory and CVE for a qualifying flaw.

## Security model

Plaincase's intended runtime data flow is:

```text
user input/file → browser memory → Web Crypto (for file hash) → IndexedDB
                                                   │
                                                   └→ explicit local download/export
```

There is no Plaincase account, remote database, analytics endpoint, or application API.
The static host serves public assets and receives ordinary web-request metadata. This
architecture reduces server-side collection; it does not make the browser a vault.

## Known boundaries

The following are design limitations, not undisclosed vulnerabilities:

- IndexedDB records and files are not encrypted by Plaincase.
- Any JavaScript executing in the deployment origin can potentially access its IndexedDB.
- An unlocked browser profile, compromised device, hostile extension, cross-site scripting
  flaw, dependency compromise, or modified deployment can expose data.
- Browser storage may be evicted or cleared. It is not a backup.
- Workspaces do not sync across browsers, profiles, origins, or devices.
- Backups, `.ics` files, and case-pack ZIPs are plaintext.
- Importing a backup replaces the current workspace after confirmation.
- Backup validation enforces a 250 MB input limit, bounded record counts, unique IDs,
  live-reference integrity, supported values, field shapes, file metadata, and data-URL shape,
  and re-hashes decoded evidence before mutation. It does not authenticate the backup
  author, establish that the records are true, scan MIME content, or preflight browser
  quota.
- Deleting evidence linked to a promise removes the file bytes and stores a non-file
  tombstone with the former filename, ID, SHA-256, and removal time. The tombstone is
  informational and does not preserve or recover the removed file.
- Uploaded files are stored and downloaded; Plaincase does not scan them for malware.
- A SHA-256 digest is not a signature, trusted timestamp, authorship proof, authenticity
  finding, or legal chain of custody.
- Status history is append-style in the ordinary UI, not immutable or tamper-evident.
- User-entered dates, actors, excerpts, filenames, MIME types, and notes are not verified.
- Clearing IndexedDB is not secure forensic deletion of exports, caches, backups, or
  storage media.
- A calendar import copies case descriptions into another system, potentially a cloud
  account.
- Availability and hosting logs remain properties of the selected static host.

Reports that merely restate one of these boundaries may be closed as expected behavior.
Reports showing a way to violate the documented boundary—for example, an unexpected
network transmission or script injection—are in scope.

## High-priority vulnerability classes

- unexpected transmission of case content or evidence;
- cross-site scripting or unsafe HTML/URL rendering;
- dependency or build compromise affecting the published bundle;
- backup parsing that enables script execution or data escape;
- case-pack path traversal or unsafe filename handling;
- cross-case deletion, overwrite, or incorrect export;
- silent loss/corruption during transactions, migration, backup, or restore;
- exposure through source maps or configuration of information that should be private;
- misleading integrity results caused by hashing or serialization defects;
- deployment configuration that serves a different application under the same trusted
  origin.

## Deployment hardening

Operators should:

- serve only over HTTPS on a dedicated origin;
- build from the committed lockfile with a supported Node.js release;
- review dependency changes and generated lockfile diffs;
- keep third-party scripts, analytics, tag managers, chat widgets, and ads off the origin;
- configure a restrictive Content Security Policy and other browser security headers when
  the host supports them;
- publish the exact corresponding source for the deployed AGPL version;
- expose a working, prominent Source link in the live application to that corresponding
  source;
- test that no case content appears in requests, logs, errors, or monitoring;
- verify direct hash routes, IndexedDB persistence, export, restore, and clear-data behavior
  after every deployment change;
- communicate immediately if a compromised deployment might have accessed local data.

Because source maps are enabled in the current production build, remember that they expose
application source structure, not user IndexedDB content or secrets. There should be no
runtime secret in the client bundle.

## User precautions

- Use a supported, updated browser and operating system.
- Protect the device with a strong login and full-disk encryption.
- Avoid shared profiles, untrusted extensions, public computers, and private-browsing
  sessions for durable work.
- Keep original evidence separately and do not edit it in place.
- Export backups after meaningful changes; encrypt them with a trusted tool if needed.
- Review and minimize every case pack before sharing.
- Use a delivery channel appropriate to the recipient and sensitivity.
- Clear site data only after verifying any backup you intend to keep.
- If the deployment origin or device may have been compromised, stop opening the site,
  preserve relevant logs, and seek appropriate technical help.

Plaincase does not provide a warranty of confidentiality, integrity, availability,
admissibility, or fitness for a legal purpose.
