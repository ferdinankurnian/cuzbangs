# AGENTS.md (cuzbangs)

## Deploy

- Deploy with `bun run deploy` (= `cf deploy --profile default`).
- Never use `--profile avaid` in this repo (that profile is bound to superweb).
- Flow: `bun run test` → `bun run build` → commit + push to `origin/main` → `bun run deploy`.
- `bun run check` is red on HEAD too (pre-existing) — don't block deploys on it.
- `dist/` and `.cloudflare/` are generated, never commit them.
- Live site: https://cuzbangs.iydheko.dev (worker `cuzbangs-v2`).

### After every deploy, always tell the user the live version

- The version is `__APP_VERSION__` = UTC build date + short sha of HEAD at build time.
- Verify it with:
  `grep -rhoE '20[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9a-f]{7,}' dist/ | sort | uniq -c`
- If the sha doesn't match the deployed commit, rebuild + redeploy so the stamp is correct.
