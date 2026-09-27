# Security Policy

## Reporting Security Issues

Phoenix: The Official Tech Club of NSEC takes the security of Cybernix Nexus seriously. If you discover or suspect a security vulnerability, please do NOT create a public GitHub issue, pull request, or discussion.

Instead, please report it via one of the following confidential channels:

* **Primary Email:** mail.phoenixnsec@gmail.com
* **GitHub Advisory:** Open a draft Security Advisory via the repository's [Security tab](https://github.com/PhoenixTechClub-NSEC/cybernixNexus/security/advisories)

### What to Include in Your Report

To help us triage and resolve the issue quickly, please provide:
* Description of the vulnerability and its potential impact
* Clear step-by-step reproduction steps or proof-of-concept (PoC)
* Affected endpoints, files, or components
* Any proposed mitigations or remediation steps (if known)

### Response SLA

* **Acknowledgment:** Within 48 hours of receipt
* **Assessment & Triage:** Within 5 business days
* **Resolution & Disclosure:** We will coordinate a remediation timeline and patch release prior to public disclosure.

---

## Supported Versions

Only the current `main` branch deployed to production receives active security updates and patches.

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | Yes                |
| 1.x     | No (Legacy/Archive) |
| < 1.0   | No                 |

---

## Security Practices in Cybernix Nexus

### 1. Authentication & Session Security
* All protected endpoints (`/api/student`, `/api/dashboard/velocity`, etc.) require authenticated sessions verified via `getServerSession(authOptions)` with NextAuth.
* Passwords are encrypted using `bcryptjs` with a work factor of 10 (`bcrypt.hash(password, 10)`). Plaintext passwords are never stored, logged, or returned in API responses.
* OAuth tokens exchanged via Google are stored securely in the PostgreSQL `Account` table with appropriate scope restrictions.

### 2. Database Protection & SQL Injection Prevention
* Database communication uses Prisma ORM. Prisma executes parameterized queries for all operations, preventing SQL injection vulnerabilities.
* User inputs and handle strings are trimmed and sanitized before persisting to the database.

### 3. Rate Limiting & Platform Scraper Safety
* External HTTP requests to competitive programming platforms (LeetCode, Codeforces, CodeChef, GeeksforGeeks) utilize strict `AbortController` timeout signals (8 to 12 seconds) to avoid thread blocking.
* Requests handle rate limits and transient connection issues gracefully using `Promise.allSettled` without exposing internal error stack traces to clients.

### 4. Environment Secrets & Access Control
* Environment configuration is loaded via environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
* Secret keys and database credentials must never be committed to source control. Production deployments should use encrypted secret managers (such as Vercel Environment Variables or Supabase Vault).
