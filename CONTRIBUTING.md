# Contributing to Cybernix Nexus

Thank you for your interest in contributing to Cybernix Nexus, the algorithmic coding and competitive programming platform maintained by Phoenix: The Official Tech Club of NSEC.

This document outlines the guidelines, workflows, and standards for contributing code, reporting bugs, and proposing new features.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](/CODE_OF_CONDUCT.md). Please read it before participating in our issues, discussions, or pull requests.

---

## Getting Started

### 1. Prerequisites

Ensure you have the following installed on your local development machine:

* **Node.js:** v20.x or higher
* **Package Manager:** `pnpm` v9.x or higher (`corepack enable && corepack prepare pnpm@latest --activate`)
* **Database:** PostgreSQL v15+ (local instance, Docker container, or hosted service like Supabase)
* **Git:** v2.30 or higher

### 2. Fork and Clone

1. Fork the repository to your GitHub account:
   ```text
   https://github.com/PhoenixTechClub-NSEC/cybernixNexus
   ```
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/cybernixNexus.git
   cd cybernixNexus
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/PhoenixTechClub-NSEC/cybernixNexus.git
   ```

### 3. Install Dependencies

Install all workspace dependencies using `pnpm`:

```bash
pnpm install
```

> Note: Cybernix Nexus standardizes on `pnpm`. Do not use `npm` or `yarn` as they generate conflicting lockfiles.

### 4. Configure Environment Variables

Create your local `.env` configuration file from the template:

```bash
cp .env.example .env
```

Open `.env` and fill in the required variables:

* `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://username:password@localhost:5432/cybernix_nexus?schema=public`)
* `NEXTAUTH_URL`: Local URL (`http://localhost:3000`)
* `NEXTAUTH_SECRET`: Random 32+ character string (generate using `openssl rand -base64 32`)
* `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Optional for local email/password testing, required for Google OAuth testing.

### 5. Initialize the Database

Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma db push
```

To inspect your local database records via a web interface:

```bash
npx prisma studio
```

### 6. Start Development Server

Run the Next.js development server:

```bash
pnpm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Development Workflow

### Branch Naming Convention

Create a descriptive topic branch for your work branching off `main`:

```bash
git checkout -b <type>/<short-description>
```

Branch types:
* `feat/` - New user-facing feature or API endpoint
* `fix/` - Bug fix
* `perf/` - Performance optimization
* `refactor/` - Code restructuring without behavioral change
* `docs/` - Documentation updates or corrections
* `chore/` - Tooling, build config, or dependency maintenance

Examples:
* `feat/leetcode-contest-scraper`
* `fix/signup-rollnumber-validation`
* `docs/readme-setup-clarification`

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short description in present imperative tense>

[optional body explaining motivation and context]

[optional footer referencing issues, e.g., Closes #42]
```

Valid types: `feat`, `fix`, `perf`, `refactor`, `style`, `test`, `docs`, `chore`.

Examples:
* `feat(editorials): add markdown syntax highlighting for C++ solutions`
* `fix(auth): handle duplicate roll number error gracefully on registration`
* `perf(dashboard): optimize top 30 student query with composite index`

---

## Code Quality Standards

### 1. App Router & Server Endpoints
* All server API routes reside in `src/app/api/` and utilize standard `NextResponse.json()` responses.
* Protected endpoints must authenticate incoming requests via `getServerSession(authOptions)`.

### 2. Database Queries & Prisma
* Always import Prisma Client via `@/lib/prisma`. Do not instantiate separate `PrismaClient` instances.
* Keep queries lean. Use `select` to retrieve only required fields.
* Never construct raw unparameterized SQL strings.

### 3. Platform Scrapers (`src/services/platforms/`)
* Scraping operations must be non-blocking with an `AbortController` timeout (maximum 8-12 seconds).
* Handle external platform rate limits, Cloudflare challenges, and network timeouts gracefully with fallbacks.
* Never block user signup or login threads on scraping failures.

### 4. UI & Styling
* Cybernix Nexus utilizes Tailwind CSS v4 and the official club design tokens defined in `src/app/globals.css`:
  * Tomato Jam: `#E5484D`
  * Golden Sand: `#FFE6B3`
  * Onyx: `#111111`
  * Pine Teal: `#00665E`
* Interactive components should support smooth animations and responsive desktop/mobile layouts.

---

## Submitting a Pull Request

1. **Keep Branches Synchronized:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Verify Lints & Types:**
   Run ESLint to ensure no syntax or lint errors exist:
   ```bash
   pnpm run lint
   ```

3. **Push to Your Fork:**
   ```bash
   git push origin <branch-name>
   ```

4. **Open a Pull Request:**
   * Go to `https://github.com/PhoenixTechClub-NSEC/cybernixNexus`
   * Click **New Pull Request** and select your branch
   * Fill out the Pull Request template completely
   * Link any related issues (e.g., `Closes #12`)
   * Maintainers will review your submission and provide feedback.

---

## Security Disclosures

If you uncover a security vulnerability, please do NOT submit a public issue or PR. Review our [Security Policy](/SECURITY.md) for confidential disclosure instructions.
