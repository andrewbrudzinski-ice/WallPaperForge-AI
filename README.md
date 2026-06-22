# WallpaperForge AI

> Device-perfect AI phone wallpapers. Pick your exact phone, and every wallpaper
> is composed so focal subjects stay clear of the clock, widgets, notch/Dynamic
> Island, punch-hole camera, and app icons.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS · Supabase** and a
swappable **AI provider abstraction** (OpenAI · Google Gemini/Imagen · Stability
AI · built-in mock).

---

## ✨ Features

- **Premium, app-store-grade mobile UI** — animated hero with parallax,
  glassmorphism, ambient gradient backdrops, large tap-to-generate style cards,
  a swipeable result carousel, a magical generation overlay (AI particles +
  cycling status messages), page transitions, and a floating 5-tab bottom nav.
- **Installable PWA** — add-to-home-screen install prompt, app icons, standalone
  display, app shortcuts, and an offline fallback via a service worker.
- **Public gallery & sharing** (Supabase) — publish a wallpaper to a shareable
  public page (`/w/<slug>`) with link-preview metadata, and browse a community
  gallery (`/gallery`). Public reads are anon-allowed via a dedicated RLS policy.
- **2–3 tap generation** — tap a style card → result, or one-tap Surprise Me.
- **In-app model selector** — switch between OpenAI, Gemini, Stability AI, and
  the mock provider from a pill dropdown; the choice is remembered locally.
- **Device-aware optimization engine** — translates each phone's safe zones into
  natural-language composition instructions injected into every prompt (users
  never see them).
- **Three generation modes** — Random (16 categories), Prompt, and Surprise Me
  (mood · palette · style · complexity).
- **Live device simulations** — full, lock screen, and home screen previews at
  your phone's exact aspect ratio, with a toggleable safe-zone overlay.
- **Variations** — generate 4 diverse alternates (color / angle / style /
  lighting) of any wallpaper.
- **Favorites, collections & history** — re-download any previous generation.
- **Premium architecture** — free vs. premium entitlements (daily limits, 4K,
  exclusive styles, priority, no ads) are fully wired; payments are intentionally
  left unimplemented behind a single tier switch.
- **Works with zero config** — the mock provider renders device-correct gradients
  so the whole app is usable before you add any API keys or a database.
- **Mobile-first, premium aesthetic** — glassmorphism, gradients, smooth Framer
  Motion transitions, dark mode, native-app feel.

---

## 🚀 Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional — the app runs without any keys)
cp .env.example .env.local

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>. With no configuration, generation uses the **mock
provider** (instant device-correct gradients) and all data persists locally in
the browser. Add keys to enable real models and cloud sync.

---

## 🔌 Enabling a real image provider

Set `IMAGE_PROVIDER` and the matching key(s) in `.env.local`:

| Provider   | `IMAGE_PROVIDER` | Required env vars                          |
| ---------- | ---------------- | ------------------------------------------ |
| OpenAI     | `openai`         | `OPENAI_API_KEY` (`OPENAI_IMAGE_MODEL`)    |
| Gemini     | `gemini`         | `GEMINI_API_KEY` (`GEMINI_IMAGE_MODEL`)    |
| Stability  | `stability`      | `STABILITY_API_KEY` (`STABILITY_IMAGE_MODEL`) |
| Mock       | `mock`           | _(none — default)_                         |

If the selected provider's key is missing, the app **automatically falls back to
the mock provider** so it never hard-fails. See
`src/lib/providers/` — implement `ImageProvider` and register it in
`src/lib/providers/index.ts` to add a new one.

---

## 🗄️ Supabase setup (optional, for cloud sync & auth)

1. Create a project at <https://app.supabase.com>.
2. In **SQL Editor**, run [`supabase/schema.sql`](./supabase/schema.sql). It
   creates all tables (Users, Devices, GeneratedWallpapers, Favorites,
   Collections, GenerationHistory), indexes, Row Level Security policies, a
   daily-quota function, and the new-user trigger.
3. Copy your project URL + anon key + service-role key into `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. (Optional) In **Authentication → Providers**, keep **Email** enabled. For the
   smoothest local testing, disable "Confirm email" so sign-up returns a session
   immediately.

### Accounts & cloud sync

When Supabase is configured, the **Profile** screen shows an email/password
account panel:

- **Sign up / sign in** with email + password (`useAuth`).
- On sign-in, your library is **pulled** from Supabase and merged into the
  store, and any items created offline are **pushed** up — nothing is lost
  (`useSync` + `lib/sync/`).
- Favorites and collections **write through** to Supabase as you change them;
  generated wallpapers + history are persisted by `/api/generate`. All writes
  are scoped by **Row Level Security** to the signed-in user.
- A `middleware.ts` keeps the auth session fresh for server routes.

Everything is **additive and fully optional**: with no Supabase keys, auth,
sync, and middleware are inert, and the Zustand store
(`src/store/app-store.ts`) remains the source of truth, persisting to
`localStorage`. The app is identical to its offline self until you sign in.

---

## 🧠 How the optimization engine works

1. The saved device profile carries normalized **safe zones** (fractions of the
   screen) for the lock clock, widget row, icon grid, status bar, camera
   cutout(s), and the recommended **focal safe zone**
   (`src/lib/devices/`).
2. Before each generation, `enhancePrompt()`
   (`src/lib/generation/optimization-engine.ts`) converts those zones into
   plain-language directives, e.g.:

   > _"Leave the top ~26% of the frame calm for the lock-screen clock. Keep the
   > top-center clear behind the Dynamic Island. Place the main subject in the
   > lower-middle safe zone…"_

3. The directive is combined with the user's creative intent and sent to the
   active provider. The user only ever sees a short friendly description.

---

## 📁 Project structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, PWA metadata
│   ├── template.tsx            # Page-transition wrapper (Framer Motion)
│   ├── page.tsx                # Entry router (onboarding vs. home)
│   ├── onboarding/             # Welcome → manufacturer → model → save
│   ├── home/                   # Centerpiece: hero, quick actions, style cards
│   ├── generate/               # Create screen: 3 modes + result sheet
│   ├── favorites/              # Favorites + collections
│   ├── history/                # Generation history + re-download
│   ├── device/                 # Profile: device, change, plan/premium
│   └── api/
│       ├── generate/route.ts   # Single generation + quota + persistence
│       └── variations/route.ts # 4 diverse variations
├── components/
│   ├── home/                   # HeroCarousel, QuickActions, StyleGrid, RecentStrip
│   ├── generate/               # GeneratorPanel, GenerationOverlay
│   ├── preview/                # DevicePreview, ResultSheet (swipeable carousel)
│   ├── nav/                    # AppHeader, BottomNav
│   └── ui/                     # Button, GlassCard, ProviderSelector, AmbientBackground
├── hooks/                      # useGenerate, useGenerationFlow
├── lib/
│   ├── devices/                # Smart device database + safe-zone builders
│   ├── generation/             # Catalog, optimization engine, service
│   ├── providers/              # AI provider abstraction (OpenAI/Gemini/…)
│   ├── supabase/               # Browser + server clients
│   ├── entitlements.ts         # Free/premium architecture
│   └── utils.ts
├── store/app-store.ts          # Zustand + localStorage persistence
└── types/index.ts              # Shared TypeScript types
supabase/schema.sql             # Full Postgres schema + RLS
```

---

## 📱 Extending the device database

Add one object to `SEEDS` in `src/lib/devices/devices.ts`:

```ts
{
  id: "my-phone",
  manufacturer: "Samsung",
  model: "Galaxy S25",
  width: 1080, height: 2340, releaseYear: 2025,
  platform: "android",
  cutout: { type: "punch-hole", centerY: 0.028, width: 0.04, height: 0.018 },
}
```

Safe zones are derived automatically by `buildSafeZones()` from the platform and
cutout — no other code changes required.

---

## 🛠️ Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the dev server         |
| `npm run build`     | Production build             |
| `npm run start`     | Run the production build     |
| `npm run lint`      | ESLint                       |
| `npm run typecheck` | TypeScript (no emit)         |

---

## 🧩 Tech notes

- **No keys required to demo.** Mock provider + localStorage make the full flow
  (onboard → generate → preview → favorite → history) work immediately.
- **Provider abstraction.** Everything depends on the `ImageProvider` interface,
  so swapping models never touches UI or generation logic.
- **Premium is data-only.** Flip a user's `tier` (DB) or use the in-app toggle on
  `/device` to unlock 4K + unlimited; wiring a billing provider later requires no
  UI changes.
