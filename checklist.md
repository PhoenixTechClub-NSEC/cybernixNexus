# Cybernix Nexus — Dynamic Data Integration Checklist

This checklist provides an exhaustive audit of all pages, components, and API routes in **Cybernix Nexus** where static or hardcoded data currently resides. In the upcoming phase, these items will be transitioned to live, database-backed, or dynamically computed values.

---

## 📋 1. Dashboard Page (`/dashboard`)
**File:** [`src/app/(main)/dashboard/page.tsx`](file:///home/johan/Phoenix/cybernixNexus/src/app/(main)/dashboard/page.tsx)

- [x] **Rating History & Contest Performance Graph (`RATING_HISTORY_DATA`)**
  - **Current State:** Hardcoded contest history arrays for CodeChef, Codeforces, and LeetCode (lines 71–99), with synthetic 3-point fallback calculations (lines 327–336).
  - **Required Dynamic Transition:** Create endpoint `GET /api/student/ratings` or expand `/api/student` to fetch chronological contest rating points and deltas directly from Codeforces API / LeetCode GraphQL / DB historical contest data.
- [x] **Weekly Practice Goals & Checklist (`goals` state)**
  - **Current State:** Hardcoded array of 4 goals (lines 270–275) with client-only local toggle state.
  - **Required Dynamic Transition:** Back goals with a `Goal` / `StudentGoal` model in Prisma OR compute dynamic goals based on real student metrics (e.g. current streak vs target, solves vs weekly quota).
- [x] **Dynamic Sprint Highlight Banner**
  - **Current State:** Hardcoded text `"Dynamic Programming Sprint by NSEC Phoenix Club"` and static `"83%"` progress badge (lines 478–493).
  - **Required Dynamic Transition:** Sourced dynamically from an active community contest/sprint event in the database.
- [x] **Personal Location & Institute Metadata**
  - **Current State:** Hardcoded `"📍 Kolkata, WB"` and `"🎓 Netaji Subhash Engg. College"` (lines 673–674).
  - **Required Dynamic Transition:** Read from student profile configuration in the database.
- [x] **DSA Topic Analysis Bar Chart**
  - **Current State:** Hardcoded denominator (`const maxVal = 415`) and empty topic counts (lines 905–946).
  - **Required Dynamic Transition:** Aggregate real tag distributions from scraped LeetCode/Codeforces submission problem tags.
- [x] **Difficulty Donut Charts**
  - **Current State:** SVG stroke approximations for Easy / Medium / Hard problems (lines 958–989).
  - **Required Dynamic Transition:** Calculate exact percentage arcs using verified solve counts from DB/scraper stats.

---

## 🏆 2. Rankings & Leaderboards Page (`/rankings`)
**File:** [`src/app/(main)/rankings/page.tsx`](file:///home/johan/Phoenix/cybernixNexus/src/app/(main)/rankings/page.tsx)

- [x] **Top Department Seasonal Bonus State (`topDeptInfo`)**
  - **Current State:** Initial state hardcoded to `{ department: 'CSE', seasonalMultiplier: 2.0, averageScore: 1845 }` (lines 35–39).
  - **Required Dynamic Transition:** Initialize cleanly via loading skeletons and hydrate purely from `/api/dashboard` summary metrics.
- [x] **Department Standings Fallback (`userDeptStat`)**
  - **Current State:** Hardcoded fallback object with `{ rank: 1, averageRating: 1845, seasonalMultiplier: 2.0 }` (lines 125–131).
  - **Required Dynamic Transition:** Handle empty/loading states gracefully without hardcoded stats.
- [x] **Department Top Performer Name**
  - **Current State:** Hardcoded placeholder `topCoderName: 'NSEC Student'` in department stats mapping (line 58).
  - **Required Dynamic Transition:** Query the highest-ranked student for each department in `/api/dashboard` and populate their real name, handle, and avatar.

---

## 👤 3. Profile & Activity Heatmap (`/profile`)
**Files:**
- [`src/app/(main)/profile/page.tsx`](file:///home/johan/Phoenix/cybernixNexus/src/app/(main)/profile/page.tsx)
- [`src/features/profile/components/StatsGrid.tsx`](file:///home/johan/Phoenix/cybernixNexus/src/features/profile/components/StatsGrid.tsx)
- [`src/components/providers/UserProvider.tsx`](file:///home/johan/Phoenix/cybernixNexus/src/components/providers/UserProvider.tsx)

- [x] **DSA Difficulty Distribution Breakdown (`solvedByDifficulty`)**
  - **Current State:** Approximated using a static heuristic (`easy = 40%`, `medium = 50%`, `hard = 10%` of LeetCode solves) in `UserProvider.tsx` (lines 106–109) and `api.ts` (lines 62–64).
  - **Required Dynamic Transition:** Store and fetch actual Easy/Medium/Hard problem solve counts from LeetCode scraper GraphQL results in `StudentStats` schema (`leetcodeEasySolved`, `leetcodeMediumSolved`, `leetcodeHardSolved`).
- [x] **Achievement Badges Tab**
  - **Current State:** Uses empty array / static placeholders (lines 175–210).
  - **Required Dynamic Transition:** Implement dynamic badge evaluation engine based on milestones (e.g. 30-day streak, 100 Hard problems, Candidate Master rank, Avahan Cup winner).
- [x] **Recent Solution Submissions & Write-ups Tab**
  - **Current State:** Uses static empty array `recentActivities: []` (lines 213–254).
  - **Required Dynamic Transition:** Fetch real activity timeline from recent accepted submissions and peer editorial publications.
- [x] **Platform Solved Counts for GFG & CodeChef**
  - **Current State:** Hardcoded to `0` in `UserProvider.tsx` and `api.ts`.
  - **Required Dynamic Transition:** Parse and persist solve counts from GFG and CodeChef profile scrapers.
- [x] **Mascot Companion Level Text & Evolution Thresholds**
  - **Current State:** Static card text mentioning Level 51 / 26,500 points (lines 147–153).
  - **Required Dynamic Transition:** Compute remaining points to next tier and mascot companion dynamically from formula `CP Score Required(L) = 50 × (L - 1)^1.6`.

---

## 📅 4. Contests & Match Calendar (`/contests`)
**File:** [`src/app/(main)/contests/page.tsx`](file:///home/johan/Phoenix/cybernixNexus/src/app/(main)/contests/page.tsx)

- [x] **Flagship Championship Contest Fallback (`flagshipContest`)**
  - **Current State:** Hardcoded fallback for `"NSEC Avahan Cup 2026 — Inter-Department Battle"` with start date `'2026-08-30T18:00:00.000Z'` and 218 registered students (lines 28, 82–90).
  - **Required Dynamic Transition:** Fetch the active flagship internal contest from the `Contest` table in PostgreSQL or display an empty/unannounced state when no internal match is active.
- [x] **Seasonal Multiplier Banner Tag**
  - **Current State:** Static text `"2.0x Seasonal Multiplier"` (line 130).
  - **Required Dynamic Transition:** Bind to the active tournament's designated multiplier value from DB.

---

## ⚡ 5. Backend API & Engine Calculations

- [x] **`GET /api/dashboard/velocity`** ([`src/app/api/dashboard/velocity/route.ts`](file:///home/johan/Phoenix/cybernixNexus/src/app/api/dashboard/velocity/route.ts))
  - **Current State:** Hardcoded rate-of-change percentage strings: `change: '+24%'`, `change: '+18%'`, `change: '+12%'` (lines 68, 75, 82).
  - **Required Dynamic Transition:** Calculate true mathematical percentage velocity:
    $$\Delta\% = \frac{\text{solves}_{\text{current}} - \text{solves}_{\text{previous}}}{\max(1, \text{solves}_{\text{previous}})} \times 100$$
- [x] **Total Score Formula Calculation** ([`src/services/platforms/sync.ts`](file:///home/johan/Phoenix/cybernixNexus/src/services/platforms/sync.ts))
  - **Current State:** Simplified linear formula `lc*10 + cf*15 + gfg` (lines 11–24) marked with developer note.
  - **Required Dynamic Transition:** Implement the official club formula:
    $$\text{Total Score} = \sum (B_q \times W_p \times M_{\text{dept}} \times M_{\text{streak}})$$
- [x] **Monthly Hall of Fame Automated Worker** ([`src/app/api/achievements/monthly/route.ts`](file:///home/johan/Phoenix/cybernixNexus/src/app/api/achievements/monthly/route.ts))
  - **Current State:** Only computes top problem solver; other categories ("Beginner of the Month", "CP Growth", "Department of the Month") are not automated.
  - **Required Dynamic Transition:** Calculate all monthly achievement categories automatically during the end-of-month cron cycle.

---

## 🗃️ 6. Core Constants & Fallbacks Cleanup
**Files:**
- [`src/lib/constants.ts`](file:///home/johan/Phoenix/cybernixNexus/src/lib/constants.ts)
- [`src/lib/api.ts`](file:///home/johan/Phoenix/cybernixNexus/src/lib/api.ts)

- [x] Deprecate static mock objects (`CURRENT_USER`, `FAKE_EDITORIALS`, `FAKE_CONTESTS`, `SEASON_PROGRESS_METRICS`).
- [x] Ensure all fallback functions in `api.ts` return empty arrays/null rather than mock static shapes.
- [x] Add loading state indicators / skeleton loaders across cards when fetching live backend data.
