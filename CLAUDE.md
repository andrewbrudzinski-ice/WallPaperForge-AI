# CLAUDE.md

Guidance for working in this repository.

## What this is

**WallpaperForge AI** — a mobile-first Next.js app that generates AI phone
wallpapers composed for the user's exact device (focal subjects kept clear of
the clock, widgets, notch/Dynamic Island, punch-hole, and app icons).

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · Zustand · Supabase ·
Stripe · Framer Motion · Vitest.**

## Commands

```bash
npm run dev        # dev server
npm run build      # production build (also type-checks + lints)
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm test           # vitest run
```

CI (`.github/workflows/ci.yml`) runs **typecheck · lint · test · build** on
every PR and push to `main`. Keep all four green.

## Core principle: graceful degradation

The app must work with **zero configuration**. Every external dependency is
optional and additive:

- **No AI keys** → the `mock` provider renders device-correct motif art.
- **No Supabase** → the Zustand store (`src/store/app-store.ts`) is the source
  of truth and persists to `localStorage`; auth/sync/gallery/middleware are inert.
- **No Stripe** → premium is a simulated toggle; no checkout, no charges.

When adding anything backend-dependent, gate it on `isConfigured`-style checks
and provide a clean fallback. Never make the zero-config path throw.

## Architecture

```
src/
├── app/                    # routes (home, generate, favorites, history,
│   │                       #   device=Profile, gallery, w/[slug], collections/[id])
│   └── api/                # generate, variations, gallery/*, billing/*
├── components/             # ui, nav, home, generate, preview, gallery,
│                           #   account, billing, collections, settings, pwa
├── hooks/                  # useGenerate, useGenerationFlow, useAuth, useSync
├── lib/
│   ├── devices/            # device DB + safe-zone builders (data-driven)
│   ├── generation/         # catalog, optimization engine, motif SVG, service
│   ├── providers/          # AI provider abstraction (openai/gemini/stability/mock)
│   ├── supabase/ sync/     # clients, middleware, two-way cloud sync
│   ├── gallery/ billing/   # public gallery + Stripe
│   └── data/ collections/  # import/export, history-filter, collection helpers
├── store/app-store.ts      # Zustand + localStorage (client source of truth)
└── types/index.ts          # shared types
supabase/schema.sql         # full Postgres schema + RLS (idempotent migrations)
```

## Conventions

- **Pure logic is extracted and unit-tested.** Anything with branching rules
  (optimization engine, safe zones, entitlements, motif resolution, gallery
  query parsing, filters, mappers) lives in `lib/` as pure functions with a
  colocated `*.test.ts`. UI stays thin. Follow this when adding features.
- **Provider abstraction:** everything depends on the `ImageProvider` interface
  (`lib/providers/types.ts`). Add a provider by implementing it and registering
  in `lib/providers/index.ts` — don't touch UI or generation logic.
- **Device DB is data-only:** add a phone by appending one `Seed` in
  `lib/devices/devices.ts`; safe zones derive automatically via `buildSafeZones`.
- **Entitlements** (`lib/entitlements.ts`) are tier-driven; premium gating reads
  from here. Stripe flips `users.tier`; `useSync` loads it on sign-in.
- **Server vs client Supabase:** browser client (RLS, user-scoped) vs service
  client (webhooks only, never client). Client code must never import the
  Stripe SDK — use `lib/billing/config.ts` for the client flag.
- **Reading search params:** client pages read `window.location.search` directly
  (guarded by `typeof window`) to avoid forcing a `useSearchParams` Suspense
  boundary. See the Home/Create pages.
- **Motion:** wrapped in `<MotionConfig reducedMotion="user">`; CSS animations
  respect `prefers-reduced-motion`. Don't add motion that ignores it.
- **IDs:** generated wallpapers use a client UUID as their id end-to-end so
  favorites/collections/likes reference the same id on client and server.

## Gotchas

- The `@supabase/ssr` middleware prints a benign `process.version` Edge-runtime
  warning at build — expected; `next build` doesn't fail on it.
- Test files are type-checked by the build; component tests need the jsdom env
  (configured in `vitest.config.ts`).
- After changing `supabase/schema.sql`, it must be re-run on the database;
  migrations are written idempotently (`add column if not exists`, etc.).

See `README.md` for setup and feature details.
