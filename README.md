# Cybernix Nexus — NSEC Inter-Department Algorithmic Coding Platform

Cybernix Nexus is a production-grade competitive programming hub for Netaji Subhash Engineering College (NSEC). It automatically syncs coding statistics across **Codeforces**, **LeetCode**, **GeeksforGeeks**, and **CodeChef**, computes seasonal department multipliers, tracks daily solve velocity, and renders live college-wide leaderboards.

---

## 🏗️ Tech Stack & Architecture

* **Framework:** Next.js 16 (App Router with Turbopack)
* **Database:** PostgreSQL (with Prisma ORM v6)
* **Authentication:** NextAuth.js (Credentials & Google OAuth Provider)
* **Styling & UI:** Tailwind CSS v4, GSAP animations, Lucide React icons
* **Scraper & Sync Engine:** Custom asynchronous platform fetchers (`leetcode.ts`, `codeforces.ts`, `gfg.ts`, `codechef.ts`)
* **Package Manager:** pnpm


I AM A TRAGEDY
TRYNA FIGURE MY WHOLE LIFE OUT
---

## 🗄️ Database Schema & Indexes

The database uses PostgreSQL with the following core Prisma models:
- **`User`**: Account identity & authentication credentials.
- **`Student`**: Profile details, department, graduation year, and platform handles.
- **`StudentStats`**: Aggregate metrics, CP total scores, college & department rankings.
- **`DailySnapshot`**: Daily solve snapshots indexed by `@@unique([studentId, date])` for historical weekly velocity graphs.
- **`MonthlyAchievement`**: Monthly Hall of Fame winners indexed by `@@index([year, month])`.
- **`SyncJob`**: Audit log of platform scraping executions.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 15+
- pnpm

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your database credentials:
```bash
cp .env.example .env
```

Example `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/cybernix_nexus?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-min-32-chars"
CRON_SECRET="your-cron-secret-bearer-token"
```

### 3. Database Migration & Seeding
Push the Prisma schema to your PostgreSQL database and execute the database seeder:
```bash
# Push schema tables & indexes
npx prisma db push

# Seed initial student profiles & 21-day velocity snapshots
npx prisma db seed
```

### 4. Run Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🔌 API Endpoints (Phase 1)

* `GET /api/dashboard`: Live student rankings, aggregate stats, and department summaries.
* `GET /api/dashboard/velocity`: Past 21-day solve velocity metrics (`thisWeek`, `lastWeek`, `twoWeeksAgo`) generated from `DailySnapshot`.
* `GET /api/achievements/monthly`: Monthly Hall of Fame achievers.
* `POST /api/achievements/monthly`: Calculate top growth achievers.
* `GET /api/cron/sync`: Secured background cron worker for platform stats sync (requires `Authorization: Bearer <CRON_SECRET>`).

---

## 🛡️ Background Cron Setup

To continuously keep student stats and daily snapshots up to date in production, set up a daily cron job (e.g. Vercel Cron or GitHub Actions) calling:
```bash
curl -X GET "https://your-domain.com/api/cron/sync" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📜 Maintainers
Maintained by *Phoenix the Official Tech Club of NSEC*.
