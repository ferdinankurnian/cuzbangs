# cuzbangs documentation

## Guides

- [Custom bangs](custom-bangs.md): format, subroutes, merge rules, and validation.
- [Deployment](deployment.md): deployment setup and CI configuration.

## Release workflow

[`cuzbangs-push-deploy`](../.agents/skills/cuzbangs-push-deploy/SKILL.md) is the canonical workflow for shipping the current branch to `main`, preparing release notes, creating a CalVer GitHub Release, and following CI deployment status. Use this skill as the source of truth for agent-assisted releases.
