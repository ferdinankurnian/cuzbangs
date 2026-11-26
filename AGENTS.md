# AGENTS.md (cuzbangs)

## Deploy

- `.agents/skills/cuzbangs-push-deploy/SKILL.md` is the canonical release
  workflow. Follow it for approval, current-branch promotion, release tags,
  patch notes, and CI status. Do not use a separate staging or feature-branch
  flow.
- Production deploys only happen from GitHub releases (CI:
  `.github/workflows/release.yml`). Pushing or merging to `main` alone deploys
  nothing.
- Never deploy manually when CI fails. Stop and report the failure.
- `dist/`, `.cloudflare/`, and `public/data/release.json` are generated,
  never commit them.
- Live site: https://cuzbangs.iydheko.dev (worker `cuzbangs-v2`).
