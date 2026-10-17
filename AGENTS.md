# AGENTS.md (cuzbangs)

## Deploy

- Production deploys only happen from GitHub releases (CI: `.github/workflows/release.yml`).
  Merging to `main` deploys nothing.
- Ship: `gh release create vYYYY.MM.DD --notes "..."` (curated notes, never
  raw commits) → CI builds (embeds tag as `__APP_VERSION__` + release body
  as patch notes) → `cf deploy --tag --message`.
- Patch notes are user-facing prose, so run the `unslop` skill on them
  before `gh release create`. Freeze them at that point: the release body
  is baked into the bundle at build time, so editing it on GitHub later
  changes nothing for users.
- Second release in one day: tag `vYYYY.MM.DD.1` (dotted). A dash
  (`v2026.10.17-1`) reads as a semver prerelease, which sorts *below*
  `v2026.10.17`. Tags are unique anyway, so re-running `gh release create`
  with the same tag just fails.
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

- The version is `__APP_VERSION__`: the release tag on release builds
  (`vYYYY.MM.DD`, plus `.N` for an extra release that day), or
  `YYYY.MM.DD.<short-sha>` when `RELEASE_TAG` is unset (dev builds).
- Verify it with:
  `grep -rhoE 'v[0-9]{4}\.[0-9]{2}\.[0-9]{2}(\.[0-9]+)?|20[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9a-f]{7,}' dist/ | sort | uniq -c`
- If the version doesn't match the tag/commit you just shipped, rebuild +
  redeploy so the stamp is correct.
