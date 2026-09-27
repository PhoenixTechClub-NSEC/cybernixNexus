# Cybernix Nexus

![Cybernix Nexus Banner](./public/banner.jpg)

An inter-department algorithmic coding and competitive programming platform for Netaji Subhash Engineering College (NSEC).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_3.0-E5484D.svg?style=flat-square&labelColor=111111)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black.svg?style=flat-square&logo=nextdotjs&labelColor=111111)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-00665E.svg?style=flat-square&logo=typescript&labelColor=111111)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4.svg?style=flat-square&logo=tailwindcss&labelColor=111111)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-v6-2D3748.svg?style=flat-square&logo=prisma&labelColor=111111)](https://www.prisma.io/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_15+-4169E1.svg?style=flat-square&logo=postgresql&labelColor=111111)](https://www.postgresql.org/)
[![Club](https://img.shields.io/badge/Maintained_By-Phoenix_NSEC-E5484D.svg?style=flat-square&labelColor=111111)](https://github.com/PhoenixTechClub-NSEC)

---

## Overview

Cybernix Nexus is a production-grade competitive programming intelligence platform built for Netaji Subhash Engineering College (NSEC). It centralizes student coding accomplishments across multiple algorithmic problem-solving platforms, calculates real-time departmental rankings using seasonal multipliers, tracks 52-week solve velocities, hosts peer tutorials and problem editorials, schedules upcoming championships, and presents an interactive college-wide leaderboard.

The project is developed and maintained as an open-source initiative by **Phoenix: The Official Tech Club of NSEC**.

---

## Table of Contents

- [Key Capabilities](#key-capabilities)
- [System Architecture](#system-architecture)
- [Competitive Programming Scoring Formula](#competitive-programming-scoring-formula)
- [Technology Stack](#technology-stack)
- [Project Directory Layout](#project-directory-layout)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup](#database-setup)
  - [Running the Development Server](#running-the-development-server)
- [API Overview](#api-overview)
- [Platform Integration Engine](#platform-integration-engine)
- [Database Migrations and Management](#database-migrations-and-management)
- [Community and Contribution](#community-and-contribution)
- [Security Policy](#security-policy)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Key Capabilities

| Feature Area | Functionality Description |
| :--- | :--- |
| **Multi-Platform Sync** | Scrapes and aggregates live statistics from LeetCode, Codeforces, CodeChef, and GeeksforGeeks asynchronously. |
| **Live Leaderboards** | College-wide and inter-departmental podiums with dynamic rank calculation based on weighted algorithmic scoring. |
| **Solve Velocity Matrix** | Tracks past 21-day velocity and 52-week activity matrices with streak counters derived from DailySnapshot records. |
| **Editorial Hub** | Community tutorial repository where students publish code explanations with syntax highlighting and peer likes. |
| **Contest Calendar** | Hybrid schedule tracking both internal college hackathons and external live rated contests. |
| **Gamification Engine** | Dynamic coder badges, level progression (L1 to L5), and tier distribution (Grandmaster, Master, Specialist, etc.). |

---

## System Architecture

Cybernix Nexus is architected around a multi-tier structure:

- **Client Layer:** Next.js 16 App Router on React 19, responsive layout styled with Tailwind CSS v4, smooth UI transitions with GSAP and Lenis, and client-side session management via NextAuth.
- **Server and API Layer:** Edge-compatible and Node.js Route Handlers (`src/app/api/*`) providing authenticated REST endpoints, background statistics computation, and rate-limited dispatchers.
- **Platform Sync Engine:** Asynchronous fetchers (`src/services/platforms/*`) interacting with LeetCode GraphQL, Codeforces REST API, and CodeChef scrapers within strict timeout budgets.
- **Data and Persistence Layer:** PostgreSQL relational database accessed through Prisma ORM v6 with connection pooling, composite indexing for time-series queries, and transactional integrity.

---

## Competitive Programming Scoring Formula

Cybernix Nexus evaluates total problem-solving proficiency using a weighted scoring model:

```text
Total Score = (CF_Solved * 1.75) + (LC_Solved * 1.5) + (CC_Solved * 1.25) + (GFG_Solved * 1.0) + Streak_Bonus
```

### Weighting Breakdown

| Metric / Platform | Multiplier | Rationale |
| :--- | :---: | :--- |
| **Codeforces** | `1.75x` | High contest rating variance and complex implementation problems |
| **LeetCode** | `1.50x` | Standardized data structures and core algorithm patterns |
| **CodeChef** | `1.25x` | Long-form and starred rated contest performance |
| **GeeksforGeeks** | `1.00x` | Fundamental algorithmic practice and topic coverage |
| **Streak Multiplier** | `+10 pts/day` | Daily solve velocity reward capped at 30 days active streak |
| **Level Requirement** | `50 * (L - 1)^1.6` | Dynamic EXP curve governing student level progression (Levels 1 to 5) |

---

## Technology Stack

### Core Framework and Styling
- **Framework:** Next.js 16.3 (App Router with Turbopack)
- **Runtime:** Node.js 20+
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS v4 with custom brand tokens (Tomato Jam, Golden Sand, Onyx, Pine Teal)
- **Animations:** GSAP 3.15, Lenis smooth scrolling, Lucide React icons

### Backend and Persistence
- **Database:** PostgreSQL 15+ (Session mode on 5432, Transaction Pooler / Supavisor on 6543)
- **ORM:** Prisma v6.19
- **Authentication:** NextAuth.js v4 (Credentials Provider and Google OAuth 2.0)
- **Concurrency Control:** p-limit for rate-governed external platform requests

---

## Project Directory Layout

- `.github/` - GitHub issue templates, pull request template, and CI workflow configurations.
- `prisma/` - PostgreSQL schema definition (`schema.prisma`) and historical database migrations.
- `public/` - Static vector assets, logos, and OpenAPI specifications.
- `scripts/` - Database backup, restore, and OpenAPI generation utilities.
- `src/app/` - Next.js App Router pages, authentication routes, and REST API handlers.
- `src/components/` - Reusable UI widgets, layout navigation, and global context providers.
- `src/features/` - Domain features including leaderboard podiums, calendars, and heatmaps.
- `src/lib/` - Shared utilities, auth options, error handlers, and Prisma database client singleton.
- `src/services/platforms/` - Platform scrapers for LeetCode, Codeforces, CodeChef, and GeeksforGeeks.
- `src/types/` - Shared TypeScript type definitions.

---

## Getting Started

### Prerequisites

Ensure the following runtimes and tools are installed on your system:

- **Node.js:** `>= 20.0.0`
- **pnpm:** `>= 9.0.0`
- **PostgreSQL:** `>= 15.0`

### Installation

1. Clone the repository:

```bash
git clone https://github.com/PhoenixTechClub-NSEC/cybernixNexus.git
cd cybernixNexus
```

2. Install dependencies using `pnpm`:

```bash
pnpm install
```

### Environment Configuration

Create a local environment file from the provided example template:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/cybernix_nexus?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-32-character-secret"

# Background Sync Authorization Token
CRON_SECRET="your-secure-cron-bearer-token"

# Google OAuth 2.0 Credentials (Optional for local testing)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Database Setup

Synchronize the Prisma schema with your PostgreSQL database:

```bash
npx prisma db push
```

To visually browse database tables and records via a web interface:

```bash
npx prisma studio
```

### Running the Development Server

Start the local development server:

```bash
pnpm run dev
```

Open `http://localhost:3000` in your web browser.

---

## API Overview

All API endpoints reside within `src/app/api/` and return standard JSON responses.

### Authentication and Student Profile

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Registers new user and student account with roll number validation. |
| `GET` | `/api/student` | Returns the authenticated student's full profile and platform solve metrics. |
| `POST` | `/api/student/sync` | Triggers immediate asynchronous platform data synchronization. |
| `POST` | `/api/student/handles` | Updates verified platform usernames (`leetcode`, `codeforces`, etc.). |
| `GET` | `/api/student/activity` | Calculates 52-week activity matrix and consecutive streak count. |

### Standings and Analytics

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Returns global standings, department comparisons, and tier distribution. |
| `GET` | `/api/dashboard/velocity` | Returns 21-day solve velocity metrics (`thisWeek`, `lastWeek`, `twoWeeksAgo`). |
| `GET` | `/api/achievements/monthly` | Fetches monthly Hall of Fame honorees. |

### Editorials and Contests

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/editorials` | Retrieves peer solutions filtered by platform, difficulty, or keyword. |
| `POST` | `/api/editorials` | Publishes a student problem walkthrough with syntax-highlighted code. |
| `POST` | `/api/editorials/[id]/like` | Toggles community endorsement on an editorial. |
| `POST` | `/api/editorials/[id]/comment` | Adds a peer discussion comment to a tutorial. |
| `GET` | `/api/contests` | Returns upcoming internal championships and external platform contests. |

### Background Synchronization

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/cron/sync` | Secured cron handler to batch sync student platform stats (Bearer token required). |

---

## Platform Integration Engine

The scraper architecture under `src/services/platforms/` uses non-blocking asynchronous adapters:

- **LeetCode Adapter (`leetcode.ts`):** GraphQL query fetching problem solve counts across difficulties (Easy, Medium, Hard) and contest ratings.
- **Codeforces Adapter (`codeforces.ts`):** Official REST API client querying user info, current rating, maximum rating, and accepted submissions.
- **CodeChef Adapter (`codechef.ts`):** HTML parsing pipeline extracting global ranking, star tier, and fully solved problem totals.
- **Synchronization Coordinator (`sync.ts`):** Dispatches platform fetchers in parallel, recalculates score aggregates, and writes records to `StudentStats` and `DailySnapshot`.

Each platform request operates within an `AbortController` timeout budget (8 to 12 seconds) with concurrency limiting (`p-limit`) to prevent thread blocking.

---

## Database Migrations and Management

Useful database maintenance scripts available via `package.json`:

```bash
# Push schema updates directly to the database
npx prisma db push

# Launch Prisma Studio database inspection interface
npx prisma studio

# Export relational tables to CSV backups (local maintenance)
pnpm run db:backup

# Restore relational tables from CSV backups
pnpm run db:feed
```

---

## Community and Contribution

We welcome contributions from developers, designers, and competitive programmers across all departments and skill levels.

Before submitting code:
1. Review the [Code of Conduct](/CODE_OF_CONDUCT.md).
2. Read the [Contributing Guidelines](/CONTRIBUTING.md) for branch naming conventions, commit standards, and pull request workflows.
3. Open an issue on GitHub to discuss proposed feature additions or bug discoveries.

---

## Security Policy

We are dedicated to safeguarding student accounts and system integrity. If you detect a security vulnerability, please do not file a public issue.

Please report vulnerabilities directly via:
- **Email:** `mail.phoenixnsec@gmail.com`
- **GitHub Security Advisory:** [Open Private Advisory](https://github.com/PhoenixTechClub-NSEC/cybernixNexus/security/advisories)

For complete details on response times and supported releases, see [SECURITY.md](/SECURITY.md).

---

## License

Cybernix Nexus is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

A copy of the license is available in the [LICENSE](/LICENSE) file.

---

## Acknowledgments

- **Phoenix: The Official Tech Club of NSEC** - Ideation, architecture, design, and stewardship.
- **Netaji Subhash Engineering College (NSEC)** - Student community, faculty guidance, and department support.
- **Competitive Programming Platforms** - LeetCode, Codeforces, CodeChef, and GeeksforGeeks for providing problem archives and coder rankings.


ohh yess
