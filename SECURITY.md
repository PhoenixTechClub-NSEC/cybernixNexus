# Cybernix Nexus — Security Policy & Guidelines

## 1. Reporting Security Issues
If you discover a security vulnerability in Cybernix Nexus, please report it confidentially to the Cybernix Development Team. Please do not create public GitHub issues for security vulnerabilities.

---

## 2. Authentication & Authorization

- **NextAuth Session Checks**: All protected API endpoints (`/api/student`, `/api/dashboard/velocity`) require valid session authentication checked via `getServerSession(authOptions)`.
- **Password Security**: User passwords are encrypted using `bcryptjs` with a cost factor of 10 (`bcrypt.hash(password, 10)`). Plaintext passwords are never stored or logged.
- **Cron Endpoint Security**: The automated platform synchronization endpoint `/api/cron/sync` requires a bearer token match against `process.env.CRON_SECRET`. Unauthorized requests return a `401 Unauthorized` response.

---

## 3. Database Security & SQL Injection Prevention

- **Prisma Parameterization**: All queries use Prisma ORM's parameterized query builder, completely eliminating raw SQL concatenation and SQL injection vulnerabilities.
- **Data Validation & Sanitization**: Email addresses are sanitized with `.toLowerCase().trim()` before querying or storing. Input strings are trimmed to prevent leading/trailing whitespace exploits.

---

## 4. API Rate Limiting & External Platform Safety

- **Timeout Control**: External HTTP calls to LeetCode, Codeforces, GeeksforGeeks, and CodeChef use `AbortController` signals with strict timeouts (8–12 seconds) to prevent server thread blocking.
- **Error Handling**: External platform scraping failures are isolated in `Promise.allSettled` and recorded per-platform in `SyncJob.error` without causing application crashes.

---

## 5. Environment Secrets Management

- **Secrets Isolation**: Environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `CRON_SECRET`, `GOOGLE_CLIENT_SECRET`) must be stored exclusively in `.env` or secure secret management systems (e.g. Vercel Secrets).
- **Git Protection**: `.env` files are ignored in `.gitignore` to prevent secret leakage in public repositories.
