# Briefly

Turn messy client notes into clean, approval-ready project briefs.
Briefly is a workspace for freelancers and small studios that structures raw
requests into goals, deliverables, exclusions, timelines, and approvals — with
a quality score and scope-gap suggestions baked in.

## Tech stack

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS** with a custom dark editorial theme + shadcn/ui primitives
- **Supabase** for authentication, Postgres database, and row-level security
- **TanStack Query** for data fetching and cache
- **React Router v6** with protected routes

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your env file from the template
cp .env.example .env
#    then edit .env and paste your Supabase URL + anon key

# 3. Start the dev server (http://localhost:8080)
npm run dev
```

Other scripts:

```bash
npm run build      # production build
npm run preview    # preview the production build
npm run test       # run the vitest suite
npm run lint       # eslint
```

## Backend setup (Supabase)

The app expects a Supabase project with the schema defined in
`supabase/migrations/`. To bootstrap:

1. Create a free project at <https://supabase.com>.
2. In **Project Settings → API**, copy the project URL and the `anon` public
   key into `.env`.
3. Apply the SQL migrations in `supabase/migrations/` using the SQL editor or
   the Supabase CLI (`supabase db push`).
4. In **Authentication → Providers → Email**, enable **Confirm email = OFF**
   so signups are instant (matches the in-app UX).

Row-level security policies in the migrations ensure each user only ever sees
their own briefs, deliverables, exclusions, assumptions, timeline items, and
billing rows.

## Project structure

```
src/
├── components/        # AppShell, CommandBar, QualityRing, dialogs, ui/
├── hooks/             # useAuth, useProfile, use-toast, use-mobile
├── integrations/      # Supabase client + generated types
├── pages/
│   ├── Index.tsx      # public landing page
│   ├── Auth.tsx       # sign in / sign up
│   └── app/           # authenticated workspace
│       ├── Dashboard.tsx       # Brief Studio
│       ├── BriefsList.tsx
│       ├── BriefEditor.tsx
│       ├── BriefPreview.tsx
│       ├── LiveBuilder.tsx     # paste-to-structure tool
│       ├── Billing.tsx         # demo plan upgrade / cancel
│       └── Settings.tsx
├── services/          # quality scoring, structure extraction, billing logic
├── types/             # shared TypeScript types
└── utils/             # formatters
```

## Features

- Email + password auth with persistent sessions and protected routes
- Per-user data isolation enforced by Postgres RLS
- Brief editor with inline deliverables, exclusions, assumptions, and timeline
- **Live Brief Builder** — paste raw client notes and watch them get structured
- **Quality score** + scope-gap suggestions on every brief
- Demo billing flow (upgrade / cancel a Pro plan locally)
- Light / dark theme toggle
- Responsive layout with mobile drawer navigation
- Command bar (⌘K / Ctrl+K) for quick actions

## License

MIT — use it, fork it, ship it.
