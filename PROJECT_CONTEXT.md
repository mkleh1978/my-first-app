# Project Context

## Tech Stack

| Technology       | Version | Purpose        

Die European FinTech Database ist eine nicht-öffentliche Web-App für das HoFT (House of Finance & Tech Berlin), mit der Nutzer über 10.000 europäische
 FinTech-Unternehmen durchsuchen, filtern und vergleichen können.

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

https://vntbbygllfhrokmogfpw.supabase.co

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudGJieWdsbGZocm9rbW9nZnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDQ0MDQsImV4cCI6MjA4NjIyMDQwNH0.lsYpIzELeNyPvSmZ6UMxU1e6VrU_9OORU8IbQ1VepGw

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudGJieWdsbGZocm9rbW9nZnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY0NDQwNCwiZXhwIjoyMDg2MjIwNDA0fQ.mKZiDVGvPa1q-BmG6bwLtI6tYaoNT0iDXJ1t5O4N9Eo


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
6. **Deploy** — Deploy to Netlify with `npx netlify deploy`

## Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start dev server         |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |
