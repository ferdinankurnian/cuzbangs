# Deployment

cuzbangs is deployed as a Cloudflare Worker with static assets. The deployment
configuration is in [`cloudflare.config.ts`](../cloudflare.config.ts) (managed
with the `cf` CLI; the legacy [`wrangler.json`](../wrangler.json) is kept for
reference and still works with `bunx wrangler deploy`). The Worker is named
`cuzbangs-v2`.

## Prerequisites

Install dependencies and authenticate cf with the Cloudflare account that
owns the Worker:

```bash
bun install
cf auth login
```

`wrangler login` is only needed the first time, or after the session expires.

## Deploy a feature

Run the checks and production build first:

```bash
bun run check
bun run test
bun run build
```

Review the changes, then commit and push the feature:

```bash
git status
git add <files-to-release>
git commit -m "feat: describe the feature"
git push origin main
```

Deploy from the repository root:

```bash
cf deploy
```

The deploy command uses the existing `dist/` output. Always run
`bun run build` after the latest source changes so the deployed assets are up
to date.

## Verify before deploying

To check what Wrangler would upload without changing the deployed Worker:

```bash
cf deploy --dry-run
```

After a real deploy, open [cuzbangs.iydheko.dev](https://cuzbangs.iydheko.dev)
and test the changed feature, including a hard refresh if the change affects
the service worker or PWA update flow.

## Notes

- A commit is not technically required by Wrangler, but committing before a
  production deploy keeps the deployed source traceable and makes rollback
  easier.
- `dist/` is generated and ignored by Git; do not commit it.
- Do not use `git add -A` blindly when the working tree contains unrelated
  changes. Stage only the files intended for the release.
