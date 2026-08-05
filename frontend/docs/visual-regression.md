# Visual regression

The lightweight Playwright suite protects five core Chinese pages at desktop,
laptop and mobile widths.

Run from the repository root:

```bash
pnpm test:visual
pnpm test:visual:update
```

`test:visual` starts Next.js on `127.0.0.1:3102` unless `VISUAL_BASE_URL` is
set. Only update snapshots for an intentional visual change, and inspect the
new images before accepting them.

Covered routes are `/zh`, `/zh/products`,
`/zh/products/detail/trolley-furnace`, `/zh/about`, and `/zh/contact`, each at
`1440x1100`, `1280x960`, and `390x844`.

Baselines live in `tests/visual/__screenshots__`; failure artifacts live in
`test-results`. Canvas and video are masked to avoid dynamic-render noise.

The default `chrome` project is the macOS development baseline. GitHub Actions
uses a separate `linux-chrome` baseline and installs `fonts-noto-cjk` before
capturing screenshots so Chinese text is deterministic and readable. CI never
updates snapshots automatically; intentional baseline changes must be captured
and inspected before they are committed.
