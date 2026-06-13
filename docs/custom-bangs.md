# Custom Bangs

Use `public/data/cuzbangs.json` to add or override store bangs without editing the Kagi dataset in `public/data/bangs.json`.

## Format

```json
[
	{
		"t": ["gpt", "chatgpt"],
		"s": "ChatGPT",
		"d": "chatgpt.com",
		"u": "https://chatgpt.com/?q={{{s}}}",
		"c": "Tech",
		"sc": "AI"
	}
]
```

Fields:

- `t`: trigger list. These are the words used after the bang symbol, like `!gpt`.
- `s`: display name.
- `d`: domain.
- `u`: target URL. Use `{{{s}}}` where the search query should go.
- `c`: category.
- `sc`: subcategory.

## Merge Rules

At runtime, cuzbangs loads both files:

```txt
/data/bangs.json
/data/cuzbangs.json
```

Then it merges them into the local store cache.

Rules:

- Custom bangs win when a trigger collides with Kagi.
- If a Kagi bang loses all triggers, it is removed.
- If a custom bang has the same `s` and `d` as a Kagi bang, they are treated as the same bang and their triggers are merged.
- Custom fields win for same-bang merges.

Example:

```txt
Kagi:   Google PT  -> gpt
Kagi:   ChatGPT    -> chatgpt, cgpt
Custom: ChatGPT    -> gpt, chatgpt
Result: ChatGPT    -> gpt, chatgpt, cgpt
```

`Google PT` disappears because its only trigger, `gpt`, is claimed by custom ChatGPT.

## Validate Custom Bangs

Run:

```bash
bun run validate-bangs
```

This checks:

- JSON shape.
- Duplicate triggers inside `cuzbangs.json`.
- Trigger collisions with Kagi.
- Same-bang merges by matching `s` and `d`.

Warnings do not block the app. They exist so you know what your custom bangs override.

## Apply Changes In The App

After editing `public/data/cuzbangs.json`, refresh the local store cache:

```txt
Settings -> Configs -> Store & Privacy -> Grab Bangs
```

The button fetches both data files, applies the merge rules, clears the local `storeBangs` IndexedDB table, and saves the merged result.
