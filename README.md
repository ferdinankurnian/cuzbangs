![Logo](docs/0.png)
# cuzbangs

cuzbangs. cuz it bangs. The fastest way to go anywhere on the internet.

A redirect engine — type a shortcut like `!yt` or `!gh` in your address bar and jump straight to the site you want, no search results page in between. Add it as your browser's default search engine and skip the middleman for good.

[cuzbangs.iydheko.dev](https://cuzbangs.iydheko.dev)

## How it works

1. **Your request** — Type a bang and query in your address bar, like `!g what is a cat?`
2. **Processing** — The browser redirects you directly. Thanks to Service Worker!
3. **Redirected** — You land straight on the search results of the site you wanted.

## Search with your search engine preferences
![Logo](docs/1.png)

Don't like Google? Use Bing. Something else entirely? Bring your own search engine with a custom URL. Choose from Google, Bing, DuckDuckGo, Kagi, or plug in your own.

## Choose your trigger prefix
![Logo](docs/2.png)

The default trigger is `!`, but you're not stuck with it — switch to `@`, `#`, `$`, or `.`, whichever feels natural on your keyboard. Same bangs, same speed, just triggered your way.

## Sub-routes
![Logo](docs/3.png)

Some bangs don't stop at the homepage. A bang like `!gh/repo cuzbangs` can redirect straight into a deeper page of a site — like GitHub's repository search — not just its root URL. Sub-routes bring more pages within reach.

## 10,000+ bangs powered by Kagi
![Logo](docs/4.png)

Access over 10,000 bangs from the [Kagi](https://kagi.com) bang catalog ([source](https://github.com/kagisearch/bangs)) out-of-the-box. Every one of their bangs works here, no setup needed.

## Custom bangs
![Logo](docs/5.png)

Need something niche? Create your own bangs to hit any site. Your custom definitions always take priority over the store list when a clash happens. See [custom-bangs.md](docs/custom-bangs.md) for the format and sub-routes documentation.

## Tech Stack

- **React 19** + **TanStack Router**
- **Dexie** (IndexedDB)
- **Tailwind CSS v4** + **shadcn UI**
- **Vite**
- **Cloudflare Workers**

## Development

```bash
bun install
bun dev
```

Build for production:

```bash
bun run build
```
