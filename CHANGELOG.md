# Changelog

All notable changes to Cybernix Nexus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
