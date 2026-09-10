# Changelog

All notable changes to Cybernix Nexus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-production-readiness] - 2026-08-21

### Added
- **Peer Editorials & Contests Prisma Models (`prisma/schema.prisma`)**: Added `Editorial`, `EditorialComment`, `EditorialLike`, `Contest`, and `ContestRegistration` models with full relational links to `Student`.
- **Dynamic Editorial Endpoints (`/api/editorials`, `/api/editorials/[id]/like`, `/api/editorials/[id]/comment`)**: Full CRUD support for student problem solution sharing with markdown formatting and language-specific code snippets.
- **Hybrid Contest Engine (`/api/contests`)**: Hybrid sourcing of college championships and live external competitive programming rounds with one-click enrollment.
- **Activity Heatmap & Streak Engine (`/api/student/activity`)**: Aggregates 52-week activity matrices from `DailySnapshot` and computes consecutive day streak counts.
- **Auth Session Persistence & "Remember Me"**: NextAuth configured for 30-day session lifetime with local storage email persistence on the login screen.
- **`AuthProvider` Client Wrapper (`src/components/providers/AuthProvider.tsx`)**: Wraps NextAuth `SessionProvider` around the app for auto-refresh on window focus and multi-tab sync.

### Changed
- **Zero Dummy Data in Production**: Removed all fake students, generated mock snapshots, and demo buttons. Cleaned `prisma/seed.ts` and purged all dummy tables.
- **No Mock Fallbacks in Production (`src/lib/api.ts` & `src/lib/constants.ts`)**: Removed fallback constants `LEADERBOARD_USERS`, `DEPARTMENT_STATS`, `FAKE_EDITORIALS`, `FAKE_CONTESTS`, `SYNCED_PLATFORM_PROFILES`, and `DSA_TOPIC_STATS` in favor of clean empty array returns.
- **Signup Validation (`/api/auth/signup`)**: Pre-validates roll number uniqueness to prevent unhandled database constraint conflicts and provides clean error reporting.

---

## [1.2.0-cron-sync] - 2026-08-16

### Added
- **Vercel Cron Job (`vercel.json`)**: Created `vercel.json` with a cron schedule `"0 0 * * 3"` (every Wednesday at 00:00 UTC) targeting `/api/cron/sync` for automated weekly platform data synchronization.
- **`lastSyncedAt` Field (`prisma/schema.prisma`)**: Added `lastSyncedAt DateTime?` to the `Student` model to track the timestamp of the last successful platform sync per student.
- **3-Day Sync Filter (`/api/cron/sync`)**: Updated the cron endpoint to only sync students whose `lastSyncedAt` is `null` or older than 3 days, skipping recently synced students. Response now includes `syncedCount`, `eligibleCount`, `skippedCount`, and `totalCount`.
- **Login-Triggered Sync (`src/lib/auth.ts`)**: Added a `events.signIn` handler to NextAuth `authOptions` that triggers a non-blocking background platform sync whenever a student with at least one configured platform handle signs in.

### Changed
- **Platform Sync Service (`src/services/platforms/sync.ts`)**: Updated `syncStudentStats` to set `lastSyncedAt: new Date()` on the `Student` record upon successful sync job completion.
- **Login Sync Guard (`src/lib/auth.ts`)**: The `events.signIn` handler now checks that a student has at least one real platform handle (`leetcode`, `codeforces`, `gfg`, `codechef`) before triggering sync — prevents spurious 404 errors from syncing dummy placeholder handles.
- **Settings Page Defaults (`src/app/(main)/settings/page.tsx`)**: Platform handle state and `initialHandlesRef` now default to empty strings `''` instead of `DUMMY_HANDLES` values. The `useEffect` DB fetch also uses empty string as fallback instead of dummy handles, so new users no longer appear to have pre-filled dummy platform usernames.

### Fixed
- **P2025 Prisma Error on Google Sign-In (`src/lib/auth.ts`)**: Replaced `prisma.user.update()` with `prisma.user.updateMany()` in `callbacks.signIn` and `callbacks.jwt` to prevent `P2025: Record to update not found` errors when a new Google user's `User` row has not yet been created by `PrismaAdapter` at the time the callback runs.
- **Cross-Account Platform Handle Leak (`src/app/(main)/settings/page.tsx`)**: Fixed a bug where all users (including new Google accounts with no student profile) were shown the same dummy platform handles (`leetcode_dummy`, `gfg_dummy`, `tourist`, `codechef_dummy`) as if they were real saved handles. Handles now correctly show blank inputs for accounts with no configured handles.

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
