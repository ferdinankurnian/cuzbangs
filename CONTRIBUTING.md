# Contributing

Thanks for helping make cuzbangs more useful. The store already includes the Kagi bang catalog, so the right place for a contribution depends on what you want to add.

## Where to contribute

### Sub-routes

Sub-routes are specific to cuzbangs. Open a [sub-route suggestion](https://github.com/ferdinankurnian/cuzbangs/issues/new?template=subroute.yml) if you have an idea but do not want to edit JSON. For a ready-to-merge change, open a pull request that adds the route to `public/data/cuzbangs.jsonc`.

### New bangs

For a bang that would be useful to lots of people, submit it to the [Kagi bangs repository](https://github.com/kagisearch/bangs). Kagi maintains the shared catalog used by cuzbangs. Its guidelines favor well-known, widely used sites and triggers that clearly identify the site. Check that repository's current guidelines before opening a pull request.

If the bang is specific to cuzbangs, or Kagi is not the right home for it, open a [bang suggestion](https://github.com/ferdinankurnian/cuzbangs/issues/new?template=bang.yml) and explain why it belongs here. Personal or niche bangs can also be added in the app's **My Bangs** settings without changing the shared catalog.

You do not need to open an issue before opening a pull request.

## Pull requests

For data contributions, edit `public/data/cuzbangs.jsonc`. See [Custom Bangs](docs/custom-bangs.md) for the full schema and merge behavior. A custom entry can add sub-routes to a Kagi bang by matching its name and domain.

For each sub-route, include:

- A short display name and useful child trigger or triggers.
- A `b` base URL for the destination when no search query is provided.
- A `u` search URL that uses `{{{s}}}` where the query belongs.
- A working example, such as `!gh/issues login bug`.

Use official HTTPS destinations where possible. Try the URL with a query and without one, and make sure the query lands in the expected search field.

Run the data validator before submitting:

```bash
bun run validate-bangs
```

Keep each pull request focused on one site or a closely related set of routes. A title like `data: add GitHub Discussions sub-route` makes the change easy to scan. Include an example bang and the validation result in the description.

## Issues

Use an issue when you have a suggestion or need help shaping the data. Include the parent bang, proposed triggers, destination URLs, and an example if you can. For new bangs, say whether you checked Kagi's catalog or already proposed it upstream. An issue is optional when you are ready to send a pull request.
