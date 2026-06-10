# Zone System Architecture — GetCleaners Nationwide

> **Status**: PROPOSAL (not implemented)  
> **Author**: Claude (architecture session)  
> **Date**: 2026-06-10  
> **Stack**: Next.js 15 + Supabase + Stripe + next-intl  

---

## 1. Executive Summary

Transform GetCleaners from an Amsterdam-only marketplace into a **nationwide Netherlands platform** with an intelligent zone system that:

- Covers all **~345 Dutch municipalities** (gemeenten) as atomic geographic units
- Progressively activates zones based on **real supply+demand signals** (not manual admin toggles)
- Generates **SEO value from day one** via cold zone landing pages
- Incentivizes cleaners to register in **underserved zones**
- Provides an admin dashboard with a **Netherlands heatmap**

### Geographic Model

```
Netherlands
  └─ Province (12)        ← grouping/filter only
       └─ Municipality (345)  ← THE zone unit (gemeente)
            └─ Neighborhood    ← optional sub-filter within active zones
```

**Why municipality, not postcode?** Postcodes (4-digit PC4 = ~4,000 areas) are too granular for a cleaning marketplace — a cleaner in "1071" serves all of Amsterdam-Zuid. Municipalities map 1:1 to what people say ("ik woon in Haarlem"), CBS data is municipality-level, and Google searches are "schoonmaker + city". Neighborhoods become a sub-filter INSIDE active zones once there's enough supply.

---

## 2. Database Schema

### 2.1 `zones` table — the core unit

```sql
-- ─────────────────────────────────────────────────────────────────────────
-- zones — every Dutch municipality. Seeded from CBS, never user-created.
-- The zone_score drives automatic status transitions.
-- ─────────────────────────────────────────────────────────────────────────
create type public.zone_status as enum ('locked', 'interest', 'active', 'overbooked');

create table if not exists public.zones (
  id                text primary key,           -- CBS gemeente code: "GM0363"
  slug              text unique not null,        -- URL slug: "amsterdam"
  name              text not null,               -- "Amsterdam"
  province          text not null,               -- "Noord-Holland"
  
  -- Geo (for map rendering + proximity queries)
  lat               numeric(9,6),                -- centroid latitude
  lng               numeric(9,6),                -- centroid longitude
  
  -- Status machine
  status            public.zone_status not null default 'locked',
  activated_at      timestamptz,                 -- when status first became 'active'
  
  -- Scoring engine outputs (recomputed by cron/event)
  zone_score        numeric(6,2) not null default 0,  -- composite 0-100
  supply_score      numeric(6,2) not null default 0,  -- cleaners registered
  demand_score      numeric(6,2) not null default 0,  -- booking attempts + searches
  intent_score      numeric(6,2) not null default 0,  -- waitlist + interest signals
  
  -- Cached counters (denormalized for fast reads)
  cleaners_count    integer not null default 0,
  bookings_30d      integer not null default 0,
  waitlist_count    integer not null default 0,
  
  -- SEO / content
  seo_title         text,                        -- custom SEO title override
  seo_description   text,                        -- custom meta description
  hero_image        text,                        -- optional zone hero image URL
  
  -- Population data (from CBS, for demand modeling)
  population        integer,
  households        integer,
  avg_income        integer,                     -- avg disposable income (euros)
  
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists zones_status_idx    on public.zones (status);
create index if not exists zones_province_idx  on public.zones (province);
create index if not exists zones_score_idx     on public.zones (zone_score desc);
create index if not exists zones_slug_idx      on public.zones (slug);

-- RLS: zones are public read, admin write
alter table public.zones enable row level security;

drop policy if exists "zones_public_select" on public.zones;
create policy "zones_public_select"
  on public.zones for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies → only service_role (admin/cron)
```

### 2.2 `zone_events` table — the event log

```sql
-- ─────────────────────────────────────────────────────────────────────────
-- zone_events — append-only event log. Every signal that affects a zone's
-- score gets recorded here. The scoring engine reads this.
-- ─────────────────────────────────────────────────────────────────────────
create type public.zone_event_type as enum (
  -- Supply signals
  'cleaner_registered',      -- a cleaner completed onboarding in this zone
  'cleaner_deactivated',     -- cleaner set visible=false or deleted profile
  'cleaner_reactivated',     -- cleaner came back online
  
  -- Demand signals
  'booking_created',         -- a booking was made for a cleaner in this zone
  'booking_completed',       -- booking marked as completed
  'booking_canceled',        -- booking canceled (negative signal)
  'search_performed',        -- user searched for this zone (aggregated hourly)
  
  -- Intent signals
  'waitlist_signup',         -- someone joined the waitlist for this zone
  'interest_expressed',      -- cleaner expressed interest in serving this zone
  'page_view',               -- zone SEO page got traffic (aggregated daily)
  
  -- Admin overrides
  'admin_activate',          -- admin manually activated a zone
  'admin_lock',              -- admin manually locked a zone
  'score_recalculated'       -- system recalculated the zone score
);

create table if not exists public.zone_events (
  id          uuid primary key default gen_random_uuid(),
  zone_id     text not null references public.zones (id),
  event_type  public.zone_event_type not null,
  actor_id    uuid,                              -- user who triggered (null for system)
  metadata    jsonb not null default '{}',        -- event-specific payload
  created_at  timestamptz not null default now()
);

create index if not exists zone_events_zone_idx    on public.zone_events (zone_id, created_at desc);
create index if not exists zone_events_type_idx    on public.zone_events (event_type);
create index if not exists zone_events_created_idx on public.zone_events (created_at desc);

-- Partition hint: after 1M+ events, consider range-partitioning by created_at month.

alter table public.zone_events enable row level security;
-- No policies → service_role only (events are system-generated)
```

### 2.3 `zone_waitlist` table — per-zone interest capture

```sql
-- ─────────────────────────────────────────────────────────────────────────
-- zone_waitlist — people interested in a zone (customers wanting service,
-- cleaners wanting to work there). Drives intent_score.
-- ─────────────────────────────────────────────────────────────────────────
create type public.waitlist_role as enum ('customer', 'cleaner');

create table if not exists public.zone_waitlist (
  id          uuid primary key default gen_random_uuid(),
  zone_id     text not null references public.zones (id),
  email       text not null,
  role        public.waitlist_role not null default 'customer',
  user_id     uuid,                              -- linked auth.user if logged in
  source      text not null default 'zone_page', -- tracking: zone_page, landing, ad, etc.
  notified    boolean not null default false,     -- set true when activation email sent
  created_at  timestamptz not null default now()
);

-- One signup per email per zone per role
create unique index if not exists zone_waitlist_unique
  on public.zone_waitlist (zone_id, lower(email), role);

create index if not exists zone_waitlist_zone_idx on public.zone_waitlist (zone_id);

alter table public.zone_waitlist enable row level security;

-- Anyone can sign up for a zone waitlist
drop policy if exists "zone_waitlist_anon_insert" on public.zone_waitlist;
create policy "zone_waitlist_anon_insert"
  on public.zone_waitlist for insert
  to anon, authenticated
  with check (true);

-- Authenticated users can see their own signups
drop policy if exists "zone_waitlist_own_select" on public.zone_waitlist;
create policy "zone_waitlist_own_select"
  on public.zone_waitlist for select
  to authenticated
  using (user_id = auth.uid() or email = auth.email());
```

### 2.4 Schema modifications to existing tables

```sql
-- ─── cleaner_profiles: add zone support ─────────────────────────────────
-- The `hood` field stays for backward compat (neighborhood within a zone).
-- `zone_id` is the primary geographic reference.
alter table public.cleaner_profiles
  add column if not exists zone_id text references public.zones (id);

-- A cleaner can serve MULTIPLE zones (e.g., lives in Haarlem, also works
-- in Amsterdam). The primary zone is cleaner_profiles.zone_id; additional
-- zones go in this junction table.
create table if not exists public.cleaner_zones (
  cleaner_id  uuid not null references public.cleaner_profiles (profile_id) on delete cascade,
  zone_id     text not null references public.zones (id),
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now(),
  primary key (cleaner_id, zone_id)
);

create index if not exists cleaner_zones_zone_idx on public.cleaner_zones (zone_id);

alter table public.cleaner_zones enable row level security;

-- Cleaner manages their own zone assignments
drop policy if exists "cleaner_zones_own_select" on public.cleaner_zones;
create policy "cleaner_zones_own_select"
  on public.cleaner_zones for select
  to authenticated
  using (auth.uid() = cleaner_id);

drop policy if exists "cleaner_zones_own_insert" on public.cleaner_zones;
create policy "cleaner_zones_own_insert"
  on public.cleaner_zones for insert
  to authenticated
  with check (auth.uid() = cleaner_id);

drop policy if exists "cleaner_zones_own_delete" on public.cleaner_zones;
create policy "cleaner_zones_own_delete"
  on public.cleaner_zones for delete
  to authenticated
  using (auth.uid() = cleaner_id);

-- Public can see zone assignments (for marketplace filtering)
drop policy if exists "cleaner_zones_public_select" on public.cleaner_zones;
create policy "cleaner_zones_public_select"
  on public.cleaner_zones for select
  to anon
  using (true);

-- ─── bookings: add zone reference ──────────────────────────────────────
alter table public.bookings
  add column if not exists zone_id text references public.zones (id);

create index if not exists bookings_zone_idx on public.bookings (zone_id);
```

### 2.5 Entity Relationship Summary

```
zones (345 rows)
  ├─── zone_events (append-only log)
  ├─── zone_waitlist (interest capture)
  ├─── cleaner_zones (M:N junction → cleaner_profiles)
  ├─── cleaner_profiles.zone_id (primary zone FK)
  └─── bookings.zone_id (which zone was this booking in)
```

---

## 3. Zone Status Machine

```
┌──────────┐     intent_score > 20      ┌──────────┐
│  LOCKED  │ ─────────────────────────▸ │ INTEREST │
│          │                             │          │
│ No supply│     admin_lock              │ Waitlist │
│ No demand│ ◂───────────────────────── │ SEO page │
└──────────┘                             └────┬─────┘
                                              │
                              zone_score > 60 │ AND
                              cleaners >= 3   │
                                              ▾
                                         ┌──────────┐
                         admin_lock      │  ACTIVE  │
                    ◂─────────────────── │          │
                                         │ Bookable │
                                         │ Listed   │
                                         └────┬─────┘
                                              │
                             demand/supply     │
                             ratio > 3.0       │
                                              ▾
                                         ┌───────────┐
                                         │OVERBOOKED │
                                         │           │
                                         │ Waitlist  │
                                         │ Incentive │
                                         └───────────┘
```

### Transition rules

| From → To | Trigger | Condition |
|---|---|---|
| LOCKED → INTEREST | Auto (scoring cron) | `intent_score > 20` (waitlist signups + page views) |
| INTEREST → ACTIVE | Auto (scoring cron) | `zone_score > 60` AND `cleaners_count >= 3` |
| ACTIVE → OVERBOOKED | Auto (scoring cron) | `demand_score / supply_score > 3.0` (demand 3x outpaces supply) |
| OVERBOOKED → ACTIVE | Auto (scoring cron) | `demand_score / supply_score <= 2.5` (hysteresis: different threshold down) |
| Any → LOCKED | Admin manual | `admin_lock` event |
| Any → ACTIVE | Admin manual | `admin_activate` event (bypass scoring) |

**Hysteresis**: OVERBOOKED→ACTIVE uses a lower threshold (2.5) than ACTIVE→OVERBOOKED (3.0) to prevent rapid oscillation.

---

## 4. Scoring Engine

### 4.1 Formula

```
zone_score = (w_supply × supply_score) + (w_demand × demand_score) + (w_intent × intent_score)

Default weights:
  w_supply = 0.45    -- supply is king in a marketplace
  w_demand = 0.35    -- real demand signals
  w_intent = 0.20    -- leading indicator (waitlist, page views)
```

### 4.2 Component scores (each 0-100)

**supply_score**:
```
raw = cleaners_active_in_zone
supply_score = min(100, (raw / target_cleaners) × 100)

target_cleaners = max(3, ceil(zone.households / 2000))
  -- 3 minimum; scales with zone size
  -- Amsterdam (450k households) → target 225
  -- Small town (5k households) → target 3
```

**demand_score**:
```
signals_30d = bookings_30d × 10           -- hard signal (weighted 10x)
            + searches_30d × 1             -- soft signal
            + booking_attempts_30d × 5     -- attempted but no cleaner available

demand_score = min(100, (signals_30d / demand_target) × 100)

demand_target = max(10, ceil(zone.population / 5000))
```

**intent_score**:
```
intent_raw = waitlist_customer_count × 3   -- customers wanting cleaning
           + waitlist_cleaner_count × 5    -- cleaners wanting to work (more valuable)
           + page_views_30d / 100          -- SEO traffic, normalized

intent_score = min(100, (intent_raw / 30) × 100)
  -- 30 = threshold: ~6 customers + 2 cleaners + some traffic = 100
```

### 4.3 Execution model

```
Option A: Supabase Edge Function (cron)       ← RECOMMENDED for v1
Option B: Next.js API route + Vercel Cron
Option C: Supabase pg_cron (pure SQL)
```

**Recommendation: Option A** — Supabase Edge Function triggered by `pg_cron` (runs every 6 hours).

```typescript
// supabase/functions/zone-scoring/index.ts (pseudocode)

// 1. For each zone, aggregate events from last 30 days
// 2. Compute supply_score, demand_score, intent_score
// 3. Compute zone_score with weights
// 4. Evaluate status transitions
// 5. Update zones table
// 6. Log score_recalculated event
// 7. If status changed: fire notifications (Resend email to waitlist)
```

**Why not real-time?** Zone scores don't need sub-second freshness. A 6-hour cadence means a zone activates within hours of hitting threshold, not days. The event log captures everything in real-time — scoring is a batch read operation on that log.

**Supplementary: event-triggered recalc.** For high-signal events (`cleaner_registered`, `booking_created`), fire an immediate re-score of THAT zone only (debounced 5 min). This catches the "3rd cleaner registers → zone goes active" case faster than waiting for the cron.

---

## 5. Backend Architecture

### 5.1 Data flow

```
User actions (booking, search, signup, waitlist)
        │
        ▾
  Server Actions / API routes
        │
        ├─▸ Write to source table (bookings, cleaner_profiles, zone_waitlist)
        │
        └─▸ Emit zone_event (INSERT into zone_events)
               │
               ├─▸ [Immediate] Debounced zone re-score (if high-signal event)
               │
               └─▸ [Batch] Cron every 6h scores ALL zones
                        │
                        ▾
                   Zone status transitions
                        │
                        ├─▸ LOCKED → INTEREST: generate SEO page (ISR revalidation)
                        ├─▸ INTEREST → ACTIVE: notify waitlist (Resend), enable booking
                        └─▸ ACTIVE → OVERBOOKED: enable incentive UI, pause new customer waitlist
```

### 5.2 File structure (new)

```
apps/web/
├── app/[locale]/
│   ├── schoonmaak/[zone]/          # Zone landing pages (SEO)
│   │   ├── page.tsx                 # Dynamic zone page (ISR)
│   │   └── opengraph-image.tsx      # OG image per zone
│   ├── schoonmaak/                  # Zone directory (all zones)
│   │   └── page.tsx
│   ├── _actions/
│   │   ├── zone-waitlist.ts         # Server Action: join zone waitlist
│   │   └── zone-events.ts          # Helper: emit zone events from actions
│   └── admin/zones/                 # Admin zone dashboard
│       └── page.tsx
├── lib/
│   ├── zones/
│   │   ├── types.ts                 # Zone types, status enum, event types
│   │   ├── data.ts                  # Zone data layer (server-only, like lib/data/cleaners.ts)
│   │   ├── scoring.ts              # Pure scoring functions (like lib/marketplace/health.ts)
│   │   ├── transitions.ts          # Status machine evaluation
│   │   └── seed.ts                 # CBS municipality seed data (345 zones)
│   └── marketplace/
│       └── health.ts               # MODIFIED: use zones instead of hardcoded hoods
├── components/
│   └── domain/
│       ├── zones/
│       │   ├── zone-card.tsx        # Zone preview card (status badge, score)
│       │   ├── zone-map.tsx         # Netherlands SVG/canvas map
│       │   ├── zone-waitlist-form.tsx
│       │   └── zone-status-badge.tsx
│       └── admin/
│           └── zone-dashboard.tsx   # Admin heatmap + controls
└── supabase/
    ├── migrations/
    │   └── 002_zones.sql            # Zone tables + RLS + triggers
    ├── functions/
    │   └── zone-scoring/
    │       └── index.ts             # Edge Function for batch scoring
    └── seed-zones.sql               # 345 municipalities from CBS
```

### 5.3 Zone data seeding

The 345 municipalities come from CBS (Centraal Bureau voor de Statistiek). Seed file format:

```sql
-- supabase/seed-zones.sql (excerpt — full file has 345 rows)
INSERT INTO public.zones (id, slug, name, province, lat, lng, population, households, avg_income)
VALUES
  ('GM0363', 'amsterdam',      'Amsterdam',      'Noord-Holland',   52.3676, 4.9041,  905234, 471982, 34100),
  ('GM0394', 'haarlemmermeer', 'Haarlemmermeer', 'Noord-Holland',   52.3026, 4.6846,  159467, 66241,  38200),
  ('GM0518', 'den-haag',       'Den Haag',       's-Gravenhage',    52.0705, 4.3007,  552995, 272876, 30800),
  ('GM0599', 'rotterdam',      'Rotterdam',      'Zuid-Holland',    51.9225, 4.4792,  656050, 330987, 29400),
  ('GM0344', 'utrecht',        'Utrecht',        'Utrecht',         52.0907, 5.1214,  361924, 176443, 35600),
  ('GM0772', 'eindhoven',      'Eindhoven',      'Noord-Brabant',   51.4416, 5.4697,  238478, 122156, 33200),
  ('GM0014', 'groningen',      'Groningen',      'Groningen',       53.2194, 6.5665,  236982, 125678, 31400),
  -- ... 338 more
ON CONFLICT (id) DO UPDATE SET
  population = excluded.population,
  households = excluded.households,
  avg_income = excluded.avg_income;

-- Amsterdam starts ACTIVE (our home market), rest are LOCKED
UPDATE public.zones SET status = 'active', activated_at = now() WHERE id = 'GM0363';
```

**CBS data source**: `https://opendata.cbs.nl/statline/` — free, updated annually. We cache it in the seed file and update once/year.

---

## 6. API Design

### 6.1 Server Actions

```typescript
// ─── app/[locale]/_actions/zone-waitlist.ts ─────────────────────────────

export async function joinZoneWaitlistAction(formData: FormData): Promise<WaitlistResult> {
  // 1. Rate limit (3 per 5 min per IP)
  // 2. Validate: zone_id exists, email is valid, role is customer|cleaner
  // 3. INSERT into zone_waitlist (ON CONFLICT → "already signed up")
  // 4. Emit zone_event: 'waitlist_signup'
  // 5. UPDATE zones SET waitlist_count = waitlist_count + 1
  // 6. Return success with zone name
}
```

```typescript
// ─── app/[locale]/_actions/zone-events.ts ───────────────────────────────

// Internal helper (not exported as Server Action — called by other actions)
export async function emitZoneEvent(
  zoneId: string,
  eventType: ZoneEventType,
  actorId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  // INSERT into zone_events
  // If high-signal event → trigger immediate zone re-score (debounced)
}
```

### 6.2 Modified existing actions

```typescript
// ─── createCleanerProfileAction (MODIFIED) ──────────────────────────────

// CHANGE: replace `hood` dropdown with zone selector
// 1. Validate zone_id (must be an existing zone)
// 2. Insert cleaner_profiles with zone_id
// 3. Insert cleaner_zones (primary zone)
// 4. Emit zone_event: 'cleaner_registered'
// 5. Recompute zone score (debounced)
```

```typescript
// ─── createBookingCheckout (MODIFIED) ────────────────────────────────────

// CHANGE: resolve zone_id from cleaner's primary zone
// 1. On checkout success → emit zone_event: 'booking_created'
// 2. On completion → emit zone_event: 'booking_completed'
```

### 6.3 Data layer

```typescript
// ─── lib/zones/data.ts ──────────────────────────────────────────────────

/** All zones with a given status */
export async function getZonesByStatus(status: ZoneStatus): Promise<Zone[]>;

/** Single zone by slug (for ISR pages) */
export async function getZoneBySlug(slug: string): Promise<Zone | null>;

/** Zones with cleaners (for marketplace browsing) */
export async function getActiveZonesWithCleaners(): Promise<ZoneWithCleanerCount[]>;

/** Cleaners in a specific zone */
export async function getCleanersByZone(zoneId: string): Promise<CleanerPreview[]>;

/** Zone suggestions (for onboarding: show zones near a postcode) */
export async function suggestZones(query: string): Promise<Zone[]>;

/** All zone slugs (for generateStaticParams) */
export async function getZoneSlugs(): Promise<string[]>;
```

---

## 7. URL Structure & SEO Strategy

### 7.1 Zone pages

```
/schoonmaak/amsterdam          → Active zone: full marketplace (cleaners, booking)
/schoonmaak/haarlem             → Interest zone: waitlist + "coming soon" + cleaner CTA
/schoonmaak/assen               → Locked zone: SEO page + waitlist + "be the first"
/schoonmaak                     → Directory: all provinces → cities
```

**Why `/schoonmaak/` not `/schoonmakers/`?** `/schoonmakers/` is already the cleaner catalog. `/schoonmaak/[zone]` = "cleaning in [city]" — the service page. The cleaner profile stays at `/schoonmakers/[slug]`.

### 7.2 SEO page variants by status

| Status | Page content | CTA |
|---|---|---|
| **ACTIVE** | Full marketplace: cleaner grid, filters, booking flow | "Boek een schoonmaker" |
| **INTEREST** | "Coming soon" banner, waitlist count, cleaner recruitment | "Houd me op de hoogte" (customer) / "Meld je aan als schoonmaker" (cleaner) |
| **LOCKED** | Minimal SEO page: "Schoonmaak in {city}", FAQ, waitlist | "Laat ons weten dat je interesse hebt" |
| **OVERBOOKED** | Full marketplace + "hoge vraag" banner, waitlist for customers | "Populair — schrijf je in voor de wachtlijst" |

### 7.3 ISR strategy

```typescript
// app/[locale]/schoonmaak/[zone]/page.tsx

export const revalidate = 3600; // 1 hour for zone pages
export const dynamicParams = true; // allow unlisted zones

export async function generateStaticParams() {
  // Pre-render active + interest zones at build time
  const zones = await getZonesByStatus(['active', 'interest']);
  return zones.map(z => ({ zone: z.slug }));
}
```

### 7.4 sitemap extension

```typescript
// app/sitemap.ts — add zone pages
const zones = await getAllZones(); // all 345
const zoneUrls = zones.map(z => ({
  url: `https://getcleaners.nl/schoonmaak/${z.slug}`,
  lastModified: z.updated_at,
  changeFrequency: z.status === 'active' ? 'daily' : 'weekly',
  priority: z.status === 'active' ? 0.8 : z.status === 'interest' ? 0.6 : 0.3,
}));
```

---

## 8. Cold Zone Strategy

Cold zones (LOCKED + INTEREST) are the **growth engine**. They capture demand signals before we can serve them.

### 8.1 SEO pages (day one value)

Every municipality gets a page targeting:
- `schoonmaker {city}` (primary keyword)
- `schoonmaak {city}` (secondary)
- `huishoudelijke hulp {city}` (long-tail)

Template content (auto-generated, i18n):
1. H1: "Schoonmaker in {city}" 
2. Intro paragraph about cleaning services in the area
3. Zone stats (if any): waitlist count, nearby active zones
4. Waitlist form (email + role)
5. FAQ (5 items, city-specific via template)
6. Link to nearest active zone ("Zoek je nu al een schoonmaker? Bekijk {nearest_active_zone}")

### 8.2 Waitlist funnel

```
Cold zone page → Waitlist form → zone_waitlist INSERT → zone_event 'waitlist_signup'
                                                             │
                                                             ▾
                                                    intent_score recalc
                                                             │
                                                    if > 20 → INTEREST
                                                    if zone_score > 60 → ACTIVE
                                                             │
                                                             ▾
                                                    Email notification via Resend
                                                    "Goed nieuws! cleaners is nu beschikbaar in {city}"
```

### 8.3 Cleaner recruitment for cold zones

When a cleaner signs up, show them:
1. Their primary zone (based on address/selection)
2. **Nearby zones with high demand** — "Er zijn al 12 mensen in Haarlem die een schoonmaker zoeken"
3. **Incentive badge** for underserved zones — priority listing, fee discount for first N bookings

---

## 9. Cleaner Incentive System

### 9.1 Incentive types (future, post-Stripe Connect)

| Incentive | Trigger | Benefit |
|---|---|---|
| **Pioneer bonus** | First 3 cleaners in a zone | 0% platform fee for first 20 bookings |
| **Priority listing** | Serve an underserved zone | Shown first in search results for that zone |
| **Zone badge** | Active in 3+ zones | "Multi-zone cleaner" badge on profile |
| **Demand alert** | High demand in nearby zone | Push notification: "{city} has 5 unserved requests" |

### 9.2 Implementation priority

Phase 1 (launch): Priority listing only (simple sort boost in query)
Phase 2 (post-Connect): Pioneer bonus (reduced `application_fee_amount` in Stripe)
Phase 3 (growth): Demand alerts via Resend + push

---

## 10. Admin Dashboard

### 10.1 Netherlands heatmap

```
┌─────────────────────────────────────────────────────────┐
│  Zone Management                              [Export]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────┐  Zone: Amsterdam     │
│   │                             │  Status: ACTIVE ●    │
│   │    Netherlands map          │  Score: 84/100       │
│   │    (SVG with colored        │  Cleaners: 12        │
│   │     municipalities)         │  Bookings/30d: 47    │
│   │                             │  Waitlist: 0         │
│   │    Green = active           │                      │
│   │    Yellow = interest        │  [Override status ▾] │
│   │    Gray = locked            │  [View events]       │
│   │    Red = overbooked         │  [Email waitlist]    │
│   │                             │                      │
│   └─────────────────────────────┘                      │
│                                                         │
│  ┌─ Summary ──────────────────────────────────────────┐ │
│  │ Active: 1  Interest: 4  Locked: 338  Overbooked: 0│ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Top zones by score ──────────────────────────────┐  │
│  │ 1. Amsterdam      84  ACTIVE    12 cleaners       │  │
│  │ 2. Utrecht         42  INTEREST  2 cleaners        │  │
│  │ 3. Rotterdam       38  INTEREST  1 cleaner         │  │
│  │ 4. Den Haag        35  INTEREST  1 cleaner         │  │
│  │ 5. Haarlem         28  INTEREST  0 cleaners        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ Recent events ───────────────────────────────────┐  │
│  │ 10:23  cleaner_registered  Utrecht    Eva V.      │  │
│  │ 09:45  waitlist_signup     Haarlem    customer    │  │
│  │ 09:12  booking_created     Amsterdam  Sofia R.    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 10.2 Admin actions

- **Override zone status** (activate/lock a zone manually)
- **Email waitlist** (trigger Resend email to all waitlist members of a zone)
- **Adjust scoring weights** (global config)
- **View event timeline** for any zone
- **Export** (CSV of zones with scores for spreadsheet analysis)

---

## 11. Migration Plan (Amsterdam → Nationwide)

### 11.1 Backward compatibility

The `hood` field in `cleaner_profiles` stays. It becomes the **neighborhood within a zone**. Migration:

```sql
-- Step 1: All existing cleaners get zone_id = 'GM0363' (Amsterdam)
UPDATE public.cleaner_profiles
SET zone_id = 'GM0363'
WHERE zone_id IS NULL;

-- Step 2: Populate cleaner_zones junction
INSERT INTO public.cleaner_zones (cleaner_id, zone_id, is_primary)
SELECT profile_id, 'GM0363', true
FROM public.cleaner_profiles
WHERE zone_id = 'GM0363'
ON CONFLICT DO NOTHING;

-- Step 3: Existing bookings get zone_id = 'GM0363'
UPDATE public.bookings
SET zone_id = 'GM0363'
WHERE zone_id IS NULL;
```

### 11.2 Onboarding wizard changes

Current: dropdown with `AMSTERDAM_HOODS` (17 neighborhoods)  
After: two-step selection: **Zone** (searchable, all municipalities) → **Neighborhood** (optional, within zone)

The `AMSTERDAM_HOODS` list becomes the neighborhood list FOR the Amsterdam zone. Other zones get their neighborhoods added over time (or cleaners free-type).

### 11.3 Marketplace pages

| Current | After |
|---|---|
| `/schoonmakers` (all cleaners, filter by hood) | `/schoonmakers` (all cleaners, filter by zone then hood) |
| `/schoonmakers/[slug]` (cleaner profile) | No change — profile page stays the same |
| — | `/schoonmaak` (zone directory) |
| — | `/schoonmaak/[zone]` (zone landing → cleaner grid for that zone) |

---

## 12. Implementation Plan (Phased)

### Phase Z1: Foundation (1 session, ~3h)

**Goal**: Zone tables in DB, seed data, zero UI changes.

1. Write `supabase/migrations/002_zones.sql` (zones + zone_events + zone_waitlist + cleaner_zones + alter existing tables)
2. Write `supabase/seed-zones.sql` (345 municipalities from CBS)
3. Create `lib/zones/types.ts` (TypeScript types mirroring the schema)
4. Create `lib/zones/data.ts` (server-only data layer)
5. Create `lib/zones/scoring.ts` (pure scoring functions + tests)
6. Migrate existing `AMSTERDAM_HOODS` → zone reference
7. Run schema in Supabase SQL Editor

**Exit criteria**: `SELECT * FROM zones WHERE status = 'active'` returns Amsterdam. Types compile. Scoring unit tests pass.

### Phase Z2: SEO Pages (1 session, ~2h)

**Goal**: Every municipality has a page. Cold zones capture leads.

1. Create `/schoonmaak/[zone]/page.tsx` (ISR, dynamic by zone status)
2. Create `/schoonmaak/page.tsx` (directory: provinces → cities)
3. Create `zone-waitlist-form.tsx` component
4. Create `joinZoneWaitlistAction` Server Action
5. Update `sitemap.ts` with 345 zone URLs
6. i18n keys for zone pages (nl + en)

**Exit criteria**: `/schoonmaak/amsterdam` shows the marketplace. `/schoonmaak/haarlem` shows "coming soon" + waitlist. Sitemap has 345+ URLs. Waitlist inserts work.

### Phase Z3: Scoring Engine (1 session, ~2h)

**Goal**: Automated zone status transitions.

1. Create `supabase/functions/zone-scoring/index.ts` (Edge Function)
2. Wire `pg_cron` to run every 6h
3. Add event emission to existing actions (booking, cleaner signup)
4. Create `emitZoneEvent` helper
5. Test: mock a zone to threshold → verify it transitions to INTEREST/ACTIVE

**Exit criteria**: A zone with 3+ cleaners and enough demand auto-activates within 6h. Events are logged. Score recalculation works.

### Phase Z4: Onboarding Migration (1 session, ~2h)

**Goal**: Cleaners pick zones instead of hoods.

1. Modify cleaner wizard: zone selector (searchable) + optional neighborhood
2. Modify `createCleanerProfileAction` to write `zone_id` + `cleaner_zones`
3. Add "serve additional zones" UI on cleaner settings
4. Emit `cleaner_registered` zone event on profile creation
5. Update marketplace filter: zone → then neighborhood

**Exit criteria**: New cleaner signs up → picks zone → appears in that zone's page. Can add multiple zones.

### Phase Z5: Admin Dashboard (1 session, ~2h)

**Goal**: Antonio can see and manage zones.

1. Netherlands SVG map component (colored by status)
2. Zone list with sorting/filtering
3. Zone detail panel (score breakdown, events timeline, waitlist)
4. Manual override controls (activate/lock)
5. Bulk waitlist email trigger

**Exit criteria**: Admin sees the map, can click zones, can override status, can email waitlists.

### Phase Z6: Polish + Incentives (1 session, ~2h)

**Goal**: Growth engine running.

1. "Nearby high-demand zones" in cleaner onboarding
2. Priority listing for underserved zones
3. Zone status badges in UI
4. Demand alerts (Resend email to cleaners near overbooked zones)
5. Analytics: zone-level conversion funnel

**Exit criteria**: Cold zone → first cleaner signup → waitlist notification → booking flow works end-to-end.

---

## 13. Technical Decisions & Trade-offs

| Decision | Why | Alternative considered |
|---|---|---|
| Municipality as zone unit | Maps to user mental model ("ik woon in Haarlem"), CBS data available, Google keyword match | PC4 postcodes (too granular), provinces (too coarse) |
| Append-only event log | Debuggable, replayable, no data loss | Direct counter updates (faster but no audit trail) |
| 6h scoring cron + event debounce | Simple, predictable, sufficient freshness | Real-time scoring (complex, unnecessary at this scale) |
| ISR for zone pages | 345 pages are fine for static generation; revalidate hourly | Full SSR (slower), pure SSG (stale data) |
| `zone_id` as text (CBS code) | Stable identifiers, never change, human-readable | UUID (opaque), integer (no meaning) |
| Multi-zone via junction table | Cleaners serve multiple cities (commuter pattern) | Single zone only (too restrictive for NL geography) |
| Neighborhood stays as free-text `hood` | Low priority to formalize; cleaners know their own neighborhood | Structured neighborhood table (over-engineering for now) |

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| 345 SEO pages create thin content | Google devalues thin pages | Unique content template per status + city-specific FAQ + real data when available |
| Scoring weights wrong initially | Zones activate too early/late | Admin override + easy weight tuning (stored in DB, not code) + hysteresis |
| Cleaners don't pick correct zone | Wrong zone assignments | Postcode-to-municipality lookup during onboarding |
| Map rendering performance | Admin dashboard slow with 345 polygons | SVG simplification + canvas fallback + only color municipalities with data |
| Event log grows unbounded | DB storage costs | Monthly partition + 12-month retention policy + aggregation job |

---

## 15. Dependencies

| Dependency | Status | Blocks |
|---|---|---|
| Supabase schema applied | PENDING (user hasn't run schema.sql yet) | Everything DB-related |
| CBS municipality data | Available (public) | Seed file creation |
| Resend integration | Not built (Roadmap #4) | Waitlist notifications |
| Stripe Connect | Not built (Roadmap #3) | Pioneer bonus incentive |
| Admin auth | Partial (role=admin exists in schema) | Admin dashboard |

---

## Appendix A: CBS Municipality Data Format

```typescript
// lib/zones/seed.ts — TypeScript source for the seed SQL

export interface MunicipalityData {
  cbsCode: string;      // "GM0363"
  slug: string;          // "amsterdam"
  name: string;          // "Amsterdam"
  province: string;      // "Noord-Holland"
  lat: number;
  lng: number;
  population: number;
  households: number;
  avgIncome: number;
}

// Top 20 municipalities by population (for reference):
// Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven, Groningen,
// Tilburg, Almere, Breda, Nijmegen, Apeldoorn, Haarlem, Arnhem,
// Enschede, Amersfoort, Zaanstad, Haarlemmermeer, 's-Hertogenbosch,
// Zoetermeer, Zwolle
```

## Appendix B: Scoring Weight Configuration

Weights are stored in a `config` table (or Supabase Vault) for runtime tuning:

```sql
create table if not exists public.zone_config (
  key    text primary key,
  value  jsonb not null,
  updated_at timestamptz not null default now()
);

INSERT INTO public.zone_config (key, value) VALUES
  ('scoring_weights', '{"supply": 0.45, "demand": 0.35, "intent": 0.20}'),
  ('activation_thresholds', '{"interest_intent": 20, "active_score": 60, "active_min_cleaners": 3, "overbooked_ratio": 3.0, "overbooked_recovery_ratio": 2.5}'),
  ('scoring_interval_hours', '6'),
  ('event_retention_months', '12')
ON CONFLICT (key) DO NOTHING;
```
