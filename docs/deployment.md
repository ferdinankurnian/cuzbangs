# Deployment

cuzbangs is deployed as a Cloudflare Worker with static assets. The deployment
configuration is in [`cloudflare.config.ts`](../cloudflare.config.ts) (managed
with the `cf` CLI). The Worker is named `cuzbangs-v2`.

Production deploys only happen from published GitHub Releases. Pushing or
merging to `main` alone does not deploy. For the canonical release procedure,
including approval, current-branch promotion, CalVer tags, patch notes, and CI
handling, follow the [`cuzbangs-push-deploy` skill](../.agents/skills/cuzbangs-push-deploy/SKILL.md).

Do not deploy manually when CI fails. Stop and report the failure.

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
