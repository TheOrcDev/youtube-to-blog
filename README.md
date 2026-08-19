# 🎥 YouTube to Blog

Application that automatically converts YouTube videos into well-structured, professional blog posts using AI. Perfect for content creators, developers, and anyone who wants to transform video content into written format.

## ✨ Features

- 🎯 **One-Click Conversion**: Simply paste a YouTube URL and get a professional blog post
- 🤖 **AI-Powered**: Uses Google's Gemini 2.5 Flash for intelligent content transformation
- 📝 **Professional Formatting**: Converts transcripts into well-structured MDX blog posts
- 🎨 **Modern UI**: Beautiful, responsive interface with dark/light mode support
- 💾 **Persistent Storage**: Automatically saves generated blogs to avoid duplicates
- 🔍 **Smart Detection**: Checks if a blog already exists for a video before generating
- 📱 **Mobile Friendly**: Fully responsive design that works on all devices
- ⚡ **Fast Performance**: Built with Next.js 15 and optimized for speed

## 🚀 How It Works

1. **Input**: User provides a YouTube video URL
2. **Extraction**: System extracts video metadata using YouTube Data API v3
3. **Transcript**: Fetches video transcript using youtube-transcript library
4. **AI Processing**: Gemini 2.5 Flash transforms the content into a professional blog post
5. **Storage**: Blog post is saved to the database with proper formatting
6. **Output**: User can view, copy, or share the generated blog post

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM
- **AI**: Google Gemini 2.5 Flash
- **Styling**: Tailwind CSS with shadcn/ui components
- **YouTube API**: Official YouTube Data API v3
- **Transcripts**: youtube-transcript library
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

1. **Enter YouTube URL**: Paste any YouTube video URL into the input field
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

| Plan | Price | Generations / month | Model |
| --- | --- | --- | --- |
| Free | $0 | 5 | Gemini 2.5 Flash |
| Pro | $9/mo or $79/yr | 100 | Premium model |
| Self-hosted | — | Unlimited | Gemini 2.5 Flash |

Usage is counted per calendar month (UTC). Requesting a video that already has a
blog costs no AI call and does not count against the limit.

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

Only if you are running a paid, hosted instance:

- `CREEM_API_KEY`
- `CREEM_WEBHOOK_SECRET`
- `CREEM_PRO_PRODUCT_ID`
- `CREEM_PRO_YEARLY_PRODUCT_ID`

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
