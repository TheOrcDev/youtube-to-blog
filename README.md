<p align="center">
  <img alt="YouTube to Blog" src="https://shieldcn.dev/header/gradient.svg?title=YouTube+to+Blog&amp;subtitle=Turn+any+video+into+a+ready-to-publish+blog+post&amp;mode=dark" />
</p>

<p align="center">
  <a href="https://github.com/TheOrcDev/youtube-to-blog/stargazers"><img alt="Stars" src="https://shieldcn.dev/github/stars/TheOrcDev/youtube-to-blog.svg" /></a>
  <a href="./license.md"><img alt="License" src="https://shieldcn.dev/github/license/TheOrcDev/youtube-to-blog.svg" /></a>
  <a href="https://github.com/TheOrcDev/youtube-to-blog/issues"><img alt="Issues" src="https://shieldcn.dev/github/issues/TheOrcDev/youtube-to-blog.svg" /></a>
  <img alt="Next.js 16" src="https://shieldcn.dev/badge/Next.js-16-black.svg" />
  <img alt="TypeScript" src="https://shieldcn.dev/badge/TypeScript-5.9-3178C6.svg" />
  <img alt="Neon Postgres" src="https://shieldcn.dev/badge/Postgres-Neon-00E599.svg" />
</p>

<p align="center">
  <b><a href="https://www.youtube2blog.com">Live app</a></b> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#self-hosting">Self-hosting</a> ·
  <a href="#configuration">Configuration</a>
</p>

---

Paste a YouTube link — or upload your own video file — and get back a
structured, first-person article you can publish as-is.

The AI **watches the video itself**, audio and visuals, through multimodal
input. There is no transcript step and no caption requirement, so it works on
videos that have no subtitles at all.

## Features

- **One-click conversion** — paste a YouTube URL, get a finished MDX post
- **Video uploads** — bring your own MP4, WebM, or QuickTime file (up to 64MB), no YouTube needed
- **True video understanding** — the model reads audio *and* visuals; captions are never required
- **Per-tier models** — Gemini 2.5 Flash on Free, a premium model on Pro, routed through the Vercel AI Gateway
- **Duplicate detection** — a YouTube video that already has a post is returned instantly, with no AI call and no quota spent
- **Privacy-friendly uploads** — uploaded video is deleted from storage the moment the post is generated, success or failure
- **Markdown export** — copy the post straight into your own site
- **Dark and light themes**, fully responsive

## How it works

**From a YouTube link**

1. Metadata (title, author, duration) is fetched from the YouTube Data API v3
2. The video URL is passed to the model as multimodal video input through the AI Gateway
3. The generated post is saved and shown, ready to copy

**From an uploaded video**

1. The browser uploads directly to Vercel Blob, so large files bypass server body limits
2. The server streams the blob to the model through the AI Gateway
3. The post is saved, its title derived from the article itself
4. The uploaded file is deleted from Blob storage immediately

## Tech stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | Neon Postgres + Drizzle ORM |
| Auth | better-auth (email/password + Google) |
| AI | Vercel AI SDK via AI Gateway |
| File storage | Vercel Blob |
| Billing | Creem (merchant of record) — optional |
| UI | Tailwind CSS + shadcn/ui |
| Tooling | Biome / Ultracite, `node --test` |

## Quick start

**Prerequisites:** Node.js 20+, pnpm, a [Neon](https://neon.tech/) database, and a
[YouTube Data API v3](https://console.developers.google.com/) key.

```bash
git clone https://github.com/TheOrcDev/youtube-to-blog.git
cd youtube-to-blog
pnpm install
```

Create `.env.local`:

```bash
# Required
DATABASE_URL=your_neon_connection_string
YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Gateway — one of the two (OIDC is provided automatically on Vercel)
AI_GATEWAY_API_KEY=vck_your_gateway_key
# VERCEL_OIDC_TOKEN=provided_by_vercel

# Required only for the video upload feature
BLOB_READ_WRITE_TOKEN=your_blob_read_write_token
```

Then set up the database and start the app:

```bash
pnpm db:migrate
pnpm dev
```

Open <http://localhost:3000>.

## Self-hosting

**Billing is entirely optional and off by default.** Leave `CREEM_API_KEY`
unset and the app runs with **unlimited generations**, no quotas, and no
pricing or billing UI — the code skips those paths completely. Bring your own
AI and YouTube keys and everything works.

Everything under [Billing](#billing-optional) applies only if you want to run a
paid, hosted instance.

## Configuration

### Plans and limits

| Plan | Price | Generations / month | Video uploads | Model |
| --- | --- | --- | --- | --- |
| Free | $0 | 5 | — | Gemini 2.5 Flash |
| Pro | $9/mo or $79/yr | 100 | ✅ up to 64MB | Premium model |
| Self-hosted | — | Unlimited | ✅ up to 64MB | Gemini 2.5 Flash |

Usage is counted per calendar month (UTC). A YouTube video that already has a
post costs no AI call and no quota; uploads always generate a fresh post and
count as one.

The 64MB upload cap exists because video bytes are sent inline (base64) through
the AI Gateway, which rejects bodies around ~100MB. It lives in
[`lib/entitlements/policy.ts`](lib/entitlements/policy.ts) as `MAX_UPLOAD_BYTES`,
alongside the per-tier limits and models. Prices live in
[`lib/billing/pricing.ts`](lib/billing/pricing.ts).

### Billing (optional)

The hosted version uses [Creem](https://creem.io) for subscriptions:

```bash
CREEM_API_KEY=your_creem_api_key
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret
CREEM_PRO_PRODUCT_ID=your_monthly_product_id
CREEM_PRO_YEARLY_PRODUCT_ID=your_yearly_product_id
CREEM_TEST_MODE=true   # use Creem's test environment while developing
```

Point your Creem dashboard webhook at `/api/webhooks/creem`. Locally, expose it
with a tunnel, for example `cloudflared tunnel --url http://localhost:3000`.

### Admin accounts

Accounts listed in `ADMIN_EMAILS` are never metered — unlimited generations on
the premium model, no subscription needed. Comma-separate for several; matching
ignores case and surrounding whitespace.

```bash
ADMIN_EMAILS=you@example.com,teammate@example.com
```

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run the test suite (`node --test`) |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format |
| `pnpm db:generate` | Generate a migration after editing `db/schema.ts` |
| `pnpm db:migrate` | Apply migrations to a fresh database |
| `pnpm db:push` | Sync schema to an existing database without a migration file |

> **Upgrading a database created before this repo had migrations?** The baseline
> migration creates every table, so it cannot be replayed against a database
> that already has the auth and blogs tables. Apply just the billing tables:
> `node --env-file=.env.local scripts/apply-billing-migration.mjs`

## Deployment

Deploys to Vercel as-is. Push to GitHub, import the repo, and set the
environment variables:

- `DATABASE_URL`, `YOUTUBE_API_KEY`, `NEXT_PUBLIC_APP_URL`
- AI Gateway auth — `AI_GATEWAY_API_KEY`, or the `VERCEL_OIDC_TOKEN` Vercel provides automatically
- `BLOB_READ_WRITE_TOKEN` — created automatically when you add a Blob store to the project

Paid instances additionally need `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`,
`CREEM_PRO_PRODUCT_ID`, `CREEM_PRO_YEARLY_PRODUCT_ID`, and optionally
`ADMIN_EMAILS`.

## Contributing

Pull requests are welcome.

1. Fork the repo and branch off `main`
2. Keep to the existing style — `pnpm lint` and `pnpm test` should pass
3. Add types for new code, and update the docs when behaviour changes
4. Open a PR describing what changed and why

Found a bug or have an idea?
[Open an issue](https://github.com/TheOrcDev/youtube-to-blog/issues).

## License

MIT — see [license.md](./license.md).

---

<p align="center">Made with 🪓 by <a href="https://orcdev.com">OrcDev</a></p>
