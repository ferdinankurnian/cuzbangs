---
name: cuzbangs-push-deploy
description: "Use when asked to push, release, or deploy cuzbangs. Ships the current branch to main after one approval, creates a CalVer GitHub Release, and reports CI deployment status."
version: 1.1.0
author: loompatt
license: MIT
metadata:
  hermes:
    tags: [cuzbangs, push, deploy, github-release, confirmation]
    category: software-development
---

# cuzbangs-push-deploy

Invoking this skill means the user is ready to ship the current branch's changes to `main` and deploy. The user has already tested the code. Work on the current branch, then promote it to `main` after one explicit approval. There is no staging or feature-branch flow.

## When to use

Use this skill when the user asks to push, release, or deploy cuzbangs.

## Repository

`~/Projects/cuzbangs`. Always write the project name as lowercase `cuzbangs`.

## Prerequisites

- Use `bun` for any JavaScript or TypeScript package commands. Do not use npm.
- The `gh` CLI is authenticated with the `repo` scope.

## Procedure

### 1. Inspect the current branch and read the actual changes

```bash
git status --short
git branch --show-current
git diff --stat
git diff --name-status
git diff
git diff --cached --stat
git diff --cached
git ls-files --others --exclude-standard
git fetch origin --tags
latest_prod_tag=$(gh release view --json tagName --jq .tagName)
git log --oneline "${latest_prod_tag}"..HEAD
git diff --stat "${latest_prod_tag}...HEAD"
git diff "${latest_prod_tag}...HEAD"
```

Do this before switching branches, committing, or drafting the release plan. Read the complete relevant diff, open changed source files and data entries, and inspect relevant untracked files. Understand the actual behavior changes. Identify unrelated, generated, local configuration, and user work. Do not infer behavior from filenames or commit titles, and never stage unrelated changes.

Stop and report if there is no current branch, no GitHub production release to identify `latest_prod_tag`, or the changes cannot be safely separated from unrelated work. Do not stash, reset, or force.

### 2. Prepare release notes and request one approval

Before making any commit or changing `main`, show the user:

1. The proposed commit message and exact files to stage.
2. The full `git log --oneline "${latest_prod_tag}"..HEAD` list. This is the committed branch history that will ship.
3. A concise summary of the reviewed code and data changes, including any uncommitted changes that will be included in the proposed commit.
4. The proposed GitHub Release patch notes, edited with the `unslop` skill.

Ask for one explicit `yes` and wait. Do not commit, merge, push, tag, or publish the release before approval. This approval covers the approved commit, promotion to `main`, push, tag, GitHub Release, and the CI-triggered deployment. Patch notes are frozen into the bundle when CI builds the release, so they cannot be corrected for users by editing the GitHub Release afterward.

If any approved file, commit message, change, or patch note changes before shipping, show the revised plan and wait for a new explicit `yes` for that scope.

#### Patch note rules

- Base notes on the code and data review in step 1. Commit messages alone are not evidence of user-visible behavior.
- Describe user-visible behavior. Keep catalog format changes separate from new bang entries, and keep editor changes separate from both.
- Use headings only for categories that actually changed, such as `New bangs`, `Updates`, `JSONC support`, or `Bang editor`.
- Under `New bangs`, use one list mapping each trigger to its destination. Show parent and child triggers clearly, for example `k`: Kagi Search and `k/news`: Kagi News. Put aliases on the same line as the corresponding service instead of creating a duplicate list.
- Under `Updates`, state what changed from the old behavior to the new behavior. For example, `cf` now opens the Cloudflare dashboard by default instead of Cloudflare Docs. Do not list routes or behavior that did not change.
- Write triggers without a prefix symbol. Users can choose `!`, `@`, `#`, `$`, or `.` in settings, so these symbols are not part of a trigger.
- Be specific about the behavior that changed. Avoid vague claims such as "editing is clearer" when the actual form or layout change can be described.
- Do not use em dash (—) punctuation in release notes. Use a colon, comma, or period instead.
- Match the app's language and terminology. Include enough detail to explain the changes without repeating the same information in multiple sections.

### 3. Commit on the current branch and promote to `main`

After approval, remember the current branch name, stage only the approved files, and commit with the approved message:

```bash
ship_branch=$(git branch --show-current)
git add <approved files>
git commit -m "<approved commit message>"
```

If `ship_branch` is not `main`, promote it as follows:

```bash
git switch main
git pull --ff-only origin main
git merge --no-ff "$ship_branch"
```

If the current branch is already `main`, skip the branch switch, pull, and merge. Then push `main`:

```bash
git push origin main
```

If the branch switch, pull, merge, or push fails, or the merge has conflicts, stop and report the exact problem. Do not stash, reset, force, or continue with a manual deployment.

`dist/`, `.cloudflare/`, and `public/data/release.json` are generated files. Never commit them.

### 4. Compute the CalVer tag and create the GitHub Release

Use `vYYYY.MM.DD` for the first release that day, then `vYYYY.MM.DD-1`, `vYYYY.MM.DD-2`, and the next unused `-N` suffix. Do not use dotted suffixes.

```bash
git fetch --tags origin
day_tag="v$(date +%Y.%m.%d)"

if git show-ref --verify --quiet "refs/tags/${day_tag}"; then
  tag_suffix=1
  while git show-ref --verify --quiet "refs/tags/${day_tag}-${tag_suffix}"; do
    tag_suffix=$((tag_suffix + 1))
  done
  release_tag="${day_tag}-${tag_suffix}"
else
  release_tag="$day_tag"
fi

printf 'Release tag: %s\n' "$release_tag"
git tag -a "$release_tag" -m "chore: release $release_tag"
git push origin "$release_tag"
gh release create "$release_tag" --title "$release_tag" --notes "<approved patch notes>"
```

Publishing the GitHub Release triggers `.github/workflows/release.yml`. CI installs dependencies with Bun, runs tests and builds, then deploys with `cf deploy --tag`. The build embeds the tag and release body in the app.

If `gh release create` fails after the tag was pushed, retry release creation with that same tag. Do not recompute the suffix or create another tag for this failure. First check `gh release view "$release_tag"` so a release that actually succeeded is not duplicated. A CI failure after a release is published burns that tag; do not reuse it for a retry.

### 5. Watch and report CI

Find the workflow run for this release tag, then watch that run:

```bash
gh run list --event release --branch "$release_tag" --limit 5
gh run watch <run_id>
gh run view <run_id> --json jobs --jq '.jobs[] | [.name, .status, .conclusion] | @tsv'
```

Use the run whose tag matches `release_tag`. Read the job names from the workflow run output; do not assume job names. Report the release tag and the actual CI result, including failed job names and relevant errors when CI fails, then stop. Do not visit, curl, or otherwise check the live production site. Never run a manual deploy if CI fails. A retry after CI failure requires fixing the cause and creating a new release with the next unused tag suffix.

## Pitfalls

- Production deploys happen only from a published GitHub Release. Pushing `main` alone does not deploy.
- Never commit `dist/`, `.cloudflare/`, or `public/data/release.json`.
- A failed `gh release create` with the tag already pushed is retried with that same tag. A published release whose CI fails burns its tag.
- Report CI status and the release tag. Do not verify the live site or deploy manually.

## Related skills

- `unslop` edits release notes before `gh release create`.
