# AGENTS.md (cuzbangs)

## Deploy

- Production deploys only happen from GitHub releases (CI: `.github/workflows/release.yml`).
  Merging to `main` deploys nothing.
- Ship: `gh release create vYYYY.MM.DD --notes "..."` (curated notes, never
  raw commits) → CI builds (embeds tag as `__APP_VERSION__` + release body
  as patch notes) → `cf deploy --tag --message`.
- Manual `bun run deploy` (= `cf deploy --profile default`) is break-glass
  only. Never use `--profile avaid` in this repo (bound to superweb).
- Never deploy or push without an explicit order.
- Flow when touching code: `bun run test` → `bun run build` → commit on a
  feature branch → merge into `development`.

### Branch model

- `main` = production truth, must always match the latest GitHub release.
  Nothing experimental lands on `main`.
- `development` = staging. Auto-sync commits (hermes cron updating
  `public/data/bangs.json` from kagisearch/bangs) and experimental work
  land here first; feature branches merge into `development`.
- Ship = merge `development` → `main` → push → `gh release create`.
- The hermes sync job commits in the main checkout while it's on
  `development` (skips + reports if another branch is checked out),
  never pushes. See `docs/deployment.md` → Branch model.
- `bun run check` is red on HEAD too (pre-existing) — don't block on it.
- `dist/`, `.cloudflare/`, and `public/data/release.json` are generated,
  never commit them.
- Live site: https://cuzbangs.iydheko.dev (worker `cuzbangs-v2`).

### After every deploy, always tell the user the live version

- The version is `__APP_VERSION__` = UTC build date + short sha of HEAD at build time.
- Verify it with:
  `grep -rhoE '20[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9a-f]{7,}' dist/ | sort | uniq -c`
- If the sha doesn't match the deployed commit, rebuild + redeploy so the stamp is correct.
