# Cybernix Nexus — NSEC Inter-Department Algorithmic Coding Platform

Cybernix Nexus is a production-grade competitive programming hub for Netaji Subhash Engineering College (NSEC). It automatically synchronizes coding statistics across **Codeforces**, **LeetCode**, **GeeksforGeeks**, and **CodeChef**, computes seasonal department multipliers, tracks daily solve velocity, hosts peer editorials, provides a hybrid contest schedule, and renders live college-wide leaderboards.
---
 
## 🏗️ Tech Stack & Architecture:

* **Framework:** Next.js 16 (App Router with Turbopack)
* **Database:** PostgreSQL (with Prisma ORM v6)
* **Authentication:** NextAuth.js (Credentials & Google OAuth with 30-day session persistence & "Remember Me")
* **Styling & UI:** Tailwind CSS v4, GSAP animations, Lucide React icons
* **Scraper & Sync Engine:** Custom asynchronous platform fetchers (`leetcode.ts`, `codeforces.ts`, `gfg.ts`, `codechef.ts`)
* **Package Manager:** pnpm
---
mani ir moddhe ekta bepar ache

## 🗄️ Database Schema & Models

The PostgreSQL database (managed via Prisma) comprises the following core models:
- **`User`**: Account identity, hashed passwords, profile pictures, and OAuth accounts.
- **`Student`**: Profile details, department, roll number, graduation year, and platform handles (`leetcode`, `codeforces`, `gfg`, `codechef`).
- **`StudentStats`**: Aggregated solve metrics, ratings, CP scores, college ranking, and department ranking.
- **`DailySnapshot`**: Daily solve snapshots indexed by `@@unique([studentId, date])` for 52-week activity matrices and velocity tracking.
- **`MonthlyAchievement`**: Monthly Hall of Fame winners indexed by `@@index([year, month])`.
- **`Editorial`**: Peer problem solutions and tutorials with code snippets, tags, and platform metadata.
- **`EditorialComment`**: Discussion tree attached to community tutorials.
- **`EditorialLike`**: Dynamic student upvotes for peer solutions.
- **`Contest`**: Hybrid match schedule tracking NSEC internal cups & live external rated rounds.
- **`ContestRegistration`**: Student contest registrations.
- **`SyncJob`**: Non-blocking platform scraping audit log.

done
---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 15+
- pnpm

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Example `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/cybernix_nexus?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-min-32-chars"
CRON_SECRET="your-cron-secret-bearer-token"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Migration
Push the Prisma schema to your PostgreSQL database:
```bash
# Push schema tables & indexes
npx prisma db push
```

### 4. Run Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🔌 API Endpoints

### Authentication & Student Profile
* `POST /api/auth/signup`: Validates credentials, checks roll number uniqueness, creates user and student profile, and triggers background handle stats sync.
* `GET /api/student`: Fetches authenticated student's full profile and platform stats.
* `GET /api/student/activity`: Computes 52-week solve matrix and consecutive streak calculation from `DailySnapshot`.
* `POST /api/student/sync`: Triggers manual platform synchronization.
* `POST /api/student/handles`: Updates platform coding handles.

### Leaderboard & Dashboard
* `GET /api/dashboard`: Real-time global standings, dynamic tier distribution, and department scores.
* `GET /api/dashboard/velocity`: 21-day solve velocity metrics (`thisWeek`, `lastWeek`, `twoWeeksAgo`).
* `GET /api/achievements/monthly`: Monthly Hall of Fame achievers.

### Peer Editorials & Contests
* `GET /api/editorials`: Filterable tutorials by platform, difficulty, and query.
* `POST /api/editorials`: Publishes peer solution with code snippets and tags.
* `POST /api/editorials/[id]/like`: Toggles tutorial upvote.
* `POST /api/editorials/[id]/comment`: Adds peer feedback comment.
* `GET /api/contests`: Hybrid sourcing of internal championships and external platform contests.
* `POST /api/contests`: Registers student for internal match.

### Background Worker
* `GET /api/cron/sync`: Secured background cron worker for automatic platform stats sync (requires `Authorization: Bearer <CRON_SECRET>`).

---

## 🛡️ Background Cron Setup

To continuously keep student stats and daily snapshots up to date in production, configure a daily cron job (e.g. Vercel Cron or GitHub Actions) calling:
```bash
curl -X GET "https://your-domain.com/api/cron/sync" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📜 Maintainers
Maintained by Cybernix the technical wing of *Phoenix the Official Tech Club of NSEC*.

---
