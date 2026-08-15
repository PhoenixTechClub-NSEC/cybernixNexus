# Changelog

All notable changes to Cybernix Nexus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0-top30-rankings] - 2026-08-15

### Added
- **`StudentStats` Indexing**: Added composite descending index `@@index([totalScore(sort: Desc)])` to `StudentStats` model in `prisma/schema.prisma` for fast score-based ranking queries.
- **Dummy Student Seeder**: Expanded `prisma/seed.ts` to generate 35 dummy students spanning CSE, IT, ECE, AI&DS, EE, and ME departments with realistic platform metrics across LeetCode, Codeforces, CodeChef, and GFG.
- **Automated Ranking Calculation**: Embedded automated ranking recalculation (`recalculateRankings()`) in `prisma/seed.ts` to pre-calculate global and department rankings upon seeding.

### Changed
- **Dashboard API Query (`/api/dashboard`)**: Optimized `GET /api/dashboard` in `src/app/api/dashboard/route.ts` to fetch top 30 students ordered by `stats.totalScore: 'desc'` via Prisma index.
- **Leaderboard API Helper (`src/lib/api.ts`)**: Updated `getLeaderboard(limit = 30)` to pass limit query parameters to `/api/dashboard`.
- **Rankings Page UI (`src/app/(main)/rankings/page.tsx`)**: Updated global standings header and count badges to "College Global Standings (Top 30)" and synced Podium & LeaderboardTable components with top 30 database rankings.

---

## [1.0.0-phase1] - 2026-08-06

### Added
- **Prisma Schema Extensions**: Added `DailySnapshot` and `MonthlyAchievement` models with indexing (`@@unique([studentId, date])`, `@@index([date])`, `@@index([year, month])`).
- **Database Seeder (`prisma/seed.ts`)**: Built seed script generating initial student profiles, 21-day historical daily solve snapshots, and monthly Hall of Fame achievements.
- **Weekly Solve Velocity API (`/api/dashboard/velocity`)**: Added server API calculating `thisWeek`, `lastWeek`, and `twoWeeksAgo` solve metrics from `DailySnapshot` entries.
- **Monthly Hall of Fame API (`/api/achievements/monthly`)**: Added GET/POST endpoints for monthly achievement retrieval and automated calculation.
- **Background Cron Worker (`/api/cron/sync`)**: Added secured background endpoint for automated daily platform scraping and snapshot generation.
- **Documentation**: Added comprehensive `README.md`, `SECURITY.md`, `CHANGELOG.md`, and updated `AGENTS.md`.

### Changed
- **Platform Sync Service (`src/services/platforms/sync.ts`)**: Updated `syncStudentStats` to automatically log/update `DailySnapshot` entries whenever platform stats are fetched.
- **Frontend Integration (`src/lib/api.ts` & Dashboard Page)**: Refactored `getLeaderboard()`, `getDepartmentStats()`, and `getMonthlyAchievements()` to fetch live data from PostgreSQL endpoints.

### Deferred
- **Phase 2 Scope**: Editorials and Contest Calendar backend models are deferred to Phase 2.
