# 🎥 YouTube to Blog

Application that turns videos into well-structured, professional blog posts using AI. Paste a YouTube link or upload your own video file — the AI watches the actual video (audio and visuals, no captions needed) and writes a ready-to-publish article. Perfect for content creators, developers, and anyone who wants to transform video content into written format.

## ✨ Features

- 🎯 **One-Click Conversion**: Paste a YouTube URL and get a professional blog post
- 📤 **Video Uploads**: Convert your own MP4, WebM, or QuickTime files (up to 64MB) — no YouTube required
- 👀 **True Video Understanding**: The AI watches the video itself via multimodal input — no transcript or captions needed
- 🤖 **AI-Powered**: Models routed through the Vercel AI Gateway (Gemini 2.5 Flash on Free, a premium model on Pro)
- 📝 **Professional Formatting**: Generates well-structured, first-person MDX blog posts
- 🎨 **Modern UI**: Beautiful, responsive interface with dark/light mode support
- 💾 **Persistent Storage**: Automatically saves generated blogs to avoid duplicates
- 🔍 **Smart Detection**: Checks if a blog already exists for a YouTube video before generating
- 🗑️ **Privacy-Friendly Uploads**: Uploaded videos are deleted as soon as the post is generated
- 📱 **Mobile Friendly**: Fully responsive design that works on all devices
- ⚡ **Fast Performance**: Built with Next.js 16 and optimized for speed

## 🚀 How It Works

### From a YouTube link

1. **Input**: User provides a YouTube video URL
2. **Metadata**: System fetches the video's title, author, and duration via YouTube Data API v3
3. **AI Processing**: The video URL is sent to the model as a multimodal video input through the Vercel AI Gateway — the AI watches the audio and visuals directly (no transcript step)
4. **Storage**: Blog post is saved to the database with proper formatting
5. **Output**: User can view, copy, or share the generated blog post

### From an uploaded video (Pro)

1. **Upload**: The browser uploads the file directly to Vercel Blob (client upload, so large files bypass server body limits)
2. **AI Processing**: The server downloads the blob and sends the raw video bytes to the model through the AI Gateway
3. **Storage**: Blog post is saved; the title is derived from the generated article
4. **Cleanup**: The uploaded video is deleted from Blob storage immediately — success or failure

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM
- **AI**: Vercel AI SDK + AI Gateway (Gemini 2.5 Flash / premium model per tier)
- **File Storage**: Vercel Blob (uploaded videos, deleted after generation)
- **Styling**: Tailwind CSS with shadcn/ui components
- **YouTube API**: Official YouTube Data API v3 (metadata only)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Google Cloud Platform account
- A Neon database account

## 🔧 Environment Setup

### 1. YouTube Data API v3 Key

1. Go to the [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Copy your API key

### 2. Database Setup

This project uses [Neon](https://neon.tech/) for PostgreSQL database hosting:

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy your database connection string
4. The connection string will be used as your `DATABASE_URL`

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# YouTube Data API v3 Key
YOUTUBE_API_KEY=your_youtube_api_key_here

# Neon Database URL
DATABASE_URL=your_neon_database_url_here

# App URL (for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel AI Gateway (one of the two; OIDC is provided automatically on Vercel)
AI_GATEWAY_API_KEY=vck_your_gateway_key_here
# VERCEL_OIDC_TOKEN=provided_by_vercel

# Vercel Blob (required for the video upload feature)
BLOB_READ_WRITE_TOKEN=your_blob_read_write_token_here
```

### 4. Billing (optional)

**Billing is entirely optional.** Leave `CREEM_API_KEY` unset — as any self-hosted
deployment normally would — and the app runs with **unlimited blog generations**
and no pricing or billing UI. Everything below only applies if you want to run a
hosted, paid instance.

The hosted version uses [Creem](https://creem.io) (merchant of record) for
subscriptions:

```bash
# Leave CREEM_API_KEY unset to disable billing entirely (unlimited usage)
CREEM_API_KEY=your_creem_api_key_here
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret_here

# Creem product IDs for the Pro plan
CREEM_PRO_PRODUCT_ID=your_monthly_product_id_here
CREEM_PRO_YEARLY_PRODUCT_ID=your_yearly_product_id_here

# Use Creem's test environment while developing
CREEM_TEST_MODE=true
```

Accounts listed in `ADMIN_EMAILS` are never metered: unlimited generations on the
premium model, no subscription required. Comma-separate for several, and match
the address the user signs in with (case and surrounding spaces are ignored).

```bash
ADMIN_EMAILS=you@example.com,teammate@example.com
```

Point your Creem dashboard webhook at `/api/webhooks/creem`. When developing
locally, expose it with a tunnel (for example
`cloudflared tunnel --url http://localhost:3000`).

Plan limits and per-tier AI models live in
[`lib/entitlements/policy.ts`](lib/entitlements/policy.ts); prices live in
[`lib/billing/pricing.ts`](lib/billing/pricing.ts).

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/youtubetoblog.git
cd youtubetoblog
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up the Database

```bash
# Apply the checked-in migrations to a fresh database
pnpm db:migrate
```

After changing `db/schema.ts`, generate a new migration with `pnpm db:generate`.

**Upgrading a database created before this repo had migrations?** The baseline
migration creates every table, so it cannot be replayed against a database that
already has the auth and blogs tables. Apply just the billing tables instead:

```bash
node --env-file=.env.local scripts/apply-billing-migration.mjs
```

### 4. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Usage

1. **Add a video**: Paste any YouTube video URL, or switch to the Upload tab and drop in your own video file (MP4, WebM, or QuickTime, up to 64MB)
2. **Click Convert**: The system will process the video and generate a blog post
3. **View Results**: See the generated blog post with options to:
   - View the full blog post
   - Copy the markdown content
   - Share the blog post

## 🔧 Configuration

### AI Model Configuration

Free generations use Google's Gemini 2.5 Flash; Pro subscribers get a premium
model. Both are configured in
[`lib/entitlements/policy.ts`](lib/entitlements/policy.ts). You can customize the
AI prompt in `server/blog-generator.ts` to change the output style or format.

### Plans and Limits

| Plan | Price | Generations / month | Video uploads | Model |
| --- | --- | --- | --- | --- |
| Free | $0 | 5 | — | Gemini 2.5 Flash |
| Pro | $9/mo or $79/yr | 100 | ✅ up to 64MB | Premium model |
| Self-hosted | — | Unlimited | ✅ up to 64MB | Gemini 2.5 Flash |

Usage is counted per calendar month (UTC). Requesting a YouTube video that
already has a blog costs no AI call and does not count against the limit.
Uploads always generate a fresh post and count as one generation.

The 64MB upload cap exists because video bytes are sent inline (base64) through
the AI Gateway, which rejects request bodies around ~100MB. The cap lives in
[`lib/entitlements/policy.ts`](lib/entitlements/policy.ts) (`MAX_UPLOAD_BYTES`).

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `YOUTUBE_API_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL` (your production URL)
- `BLOB_READ_WRITE_TOKEN` (for video uploads; created automatically when you add a Blob store to the Vercel project)
- AI Gateway auth (`AI_GATEWAY_API_KEY`, or the `VERCEL_OIDC_TOKEN` Vercel provides automatically)

Only if you are running a paid, hosted instance:

- `CREEM_API_KEY`
- `CREEM_WEBHOOK_SECRET`
- `CREEM_PRO_PRODUCT_ID`
- `CREEM_PRO_YEARLY_PRODUCT_ID`
- `ADMIN_EMAILS` (optional; accounts that bypass metering)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add TypeScript types for new features
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help:

- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

Made with axe 🪓 by OrcDev
