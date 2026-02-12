# Project Context

## Tech Stack

| Technology       | Version | Purpose                        |
| ---------------- | ------- | ------------------------------ |
| Next.js          | 16.1.6  | React framework (App Router)   |
| React            | 19.2.3  | UI library                     |
| TypeScript       | 5.x     | Type safety (strict mode)      |
| Tailwind CSS     | 4.x     | Utility-first CSS              |
| ESLint           | latest  | Code linting                   |
| Supabase JS      | 2.95.3  | Backend client (auth, DB, etc) |

## Folder Structure

```
my-first-app/
├── public/              # Static assets (images, fonts, etc.)
├── src/
│   ├── app/             # App Router — pages, layouts, route handlers
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Home page (/)
│   │   └── globals.css  # Global styles + Tailwind imports
│   ├── components/      # Reusable React components
│   └── lib/
│       └── supabase.ts  # Supabase client instance
├── .env.local.example   # Template for environment variables
├── .mcp.json            # MCP server config (Supabase)
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration (strict mode)
└── package.json         # Dependencies and scripts
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

| Variable                       | Description                          |
| ------------------------------ | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`     | Your Supabase project URL            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Your Supabase anonymous/public key   |

You can find these values in your Supabase dashboard under **Settings > API**.

## Next Steps

1. **Set up environment variables** — Copy `.env.local.example` to `.env.local` and add your Supabase credentials
2. **Design your database schema** — Create tables in Supabase Dashboard or via migrations
3. **Build components** — Add reusable UI components in `src/components/`
4. **Add pages** — Create routes under `src/app/` using the App Router conventions
5. **Add authentication** — Use `@supabase/ssr` for server-side auth if needed
6. **Deploy** — Deploy to Vercel with `npx vercel`

## Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start dev server         |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |
