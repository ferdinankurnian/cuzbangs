# Deployment

cuzbangs is deployed as a Cloudflare Worker with static assets. The deployment
configuration is in [`cloudflare.config.ts`](../cloudflare.config.ts) (managed
with the `cf` CLI). The Worker is named `cuzbangs-v2`.

Production deploys only happen from GitHub releases. Merging to `main`
deploys nothing — it just runs validation (tests + build) on the pull request.

## Branch model

There are two long-lived branches:

- `main` — production truth. It must always match the latest GitHub
  release. If `main` doesn't equal a release tag, something went wrong.
  Nothing experimental lands here.
- `development` — staging. Auto-sync commits (Kagi bangs catalog updates
  from the hermes cron) land here first, and experimental work merges
  here before it's ready to ship.

Feature branches (`feat/*`, `fix/*`, `chore/*`) branch off `main` and
merge into `development` while still experimental. A release promotes
them:

1. Merge `development` → `main` (this is the "siap-siap" gate — only
   merge when the content is release-worthy).
2. Push `main`.
3. Create the GitHub release (`gh release create vYYYY.MM.DD`, see
   below) — that, not the merge, is what deploys.

The hermes auto-sync job commits in `~/Projects/cuzbangs` while it is
checked out on `development`. It verifies the current branch first and
skips with a report if anything else is checked out. It commits but
never pushes — pushing is always the owner's action.

## Ship a release

1. Write curated release notes for humans (never raw commit messages) and
   create the release. Tag with calver (`vYYYY.MM.DD`, append `.1` for a
   second release in a day):

   > **Notes are frozen at build time.** The release body is embedded into
   > the bundle (`public/data/release.json` via the `prebuild` script) when
   > CI builds. Editing the release body on GitHub afterwards does NOT
   > change what users see — and re-running the workflow only replays the
   > original event payload. So make the notes final **before** running
   > `gh release create`; to fix a typo live you'd need a manual
   > break-glass deploy or another release.

   ```bash
   gh release create v2026.10.15 --notes "..."
   ```

2. CI takes over (`.github/workflows/release.yml`): install, test, build,
   then `cf deploy --tag <tag> --message <release name>`. The build embeds
   the tag as `__APP_VERSION__` and the release body as the in-app
   patch notes, so the notes you write are exactly what users see in the
   Update tab.

3. Verify: open [cuzbangs.iydheko.dev](https://cuzbangs.iydheko.dev),
   check the Update tab shows the new version + notes (hard refresh if the
   service worker holds the old one).

## Manual deploy (break glass only)

Normal flow needs no local deploy. If CI is down and you must deploy by hand:

```bash
bun run test
bun run build
bun run deploy
```

`bun run deploy` is `cf deploy --profile default` — never `--profile avaid`
(that profile belongs to another project). The deploy uses the existing
`dist/`, so always build first.

## CI authentication

CI authenticates with an API token, not OAuth. Two repository secrets:

- `CLOUDFLARE_API_TOKEN` — token with Workers Scripts Write (scoped to
  `cuzbangs-v2`) + Account Settings Read (+ Workers Routes Write if deploys
  ever manage routes). Create/rotate it without the dashboard:

  ```bash
  cf user tokens create --name "cuzbangs-ci-deploy" \
    --policies @policies.json \
    --expires-on "2027-10-15T00:00:00Z"
  ```

  The token value prints once — store it straight into the secret.
- `CLOUDFLARE_ACCOUNT_ID` — selects the account in non-interactive runs.

## Notes

- `dist/`, `.cloudflare/`, and `public/data/release.json` are generated and
  ignored by Git; do not commit them.
- Never deploy or push without an explicit order.
- After every deploy, report the live version (`__APP_VERSION__` = release
  tag, or date+sha on dev builds). Verify with:
  `grep -rhoE '20[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9a-f]{7,}|v[0-9]{4}\.[0-9]{2}\.[0-9]{2}(\.[0-9]+)?' dist/ | sort | uniq -c`
