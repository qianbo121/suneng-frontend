# Picomatch repeated wildcard patch

GHSA-fc5q-39xc-vjpf was added to the main-branch audit on 2026-11-17. The official advisory lists versions through 4.0.7 and no fixed release. The user authorized a project-maintained repair followed by the normal release checks.

## Scope and behavior

The three installed versions 2.3.2, 4.0.4 and 4.0.5 receive a package-manager patch. A wildcard inside a repeated extglob, such as `+(*a)` or `+(*)z`, is detected even when the body has only one branch. The existing risky-pattern literal fallback is used. These patterns now match their literal spelling. Escaped stars, quoted stars, character sets and previously safe flattened repeated groups retain their behavior. The existing explicit `maxExtglobRecursion: false` opt-out remains an unsafe opt-out and must not be used with untrusted patterns. This bounded repair covers the reported wildcard/repeat issue, not every possible regular-expression resource attack.

Package names and versions are retained. All unrelated lockfile entries are retained. Both applications use this dependency in build/test tooling. The frontend production graph also includes picomatch through next-intl → @parcel/watcher. The backend production dependency tree contains no picomatch package. Application source and backend runtime dependencies are unchanged by this patch. Full frontend and backend quality checks still run. The selected runtime release is frontend, to deliver the already-reviewed article case-link fix.

## Verification

`frontend/scripts/picomatch-check.mjs` checks all installed package instances, exact package-manager registration, patch and runtime digests, actual consumer resolution, and a bounded subprocess with 146 assertions per version. Assertions cover malicious inputs, literal fallback, normal glob matching, options and real micromatch usage. Unpatched versions stall on the same bounded malicious-input probe. Verifier tests also reject changed patches, missing lock registration, unpatched instances and altered runtime files.

The existing full dependency audit still runs and its unmodified report is retained. Only this exact advisory and the three verified versions can be handled by this repair. Other high/critical findings, unverified patches, report inconsistencies and audit failures remain blocking. The previous braces handling retains its original expiry. Picomatch handling expires on 2026-12-17 at 16:00 UTC, when the official release and maintenance need must be reassessed.

Official source: https://github.com/advisories/GHSA-fc5q-39xc-vjpf
