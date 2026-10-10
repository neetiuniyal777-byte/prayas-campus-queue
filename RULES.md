# Project Rules & Invariants

This document outlines the non-negotiable architectural and security rules for this project. These rules must be strictly followed in every development phase and task.

---

### 1. Key & Secret Management
* **Never expose secret keys in frontend code.**
* Only the Supabase URL (`NEXT_PUBLIC_SUPABASE_URL`) and Supabase Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) are allowed to be prefixed with `NEXT_PUBLIC_`.
* The Supabase Service-Role key (`SUPABASE_SERVICE_ROLE_KEY`) must **NEVER** start with `NEXT_PUBLIC_` and must **NEVER** be accessible or bundled to client-side code.
* Any admin client using the service-role key (such as `src/lib/supabase/admin.ts`) must have `import "server-only";` at the very top of the file so that any accidental client-side import causes an immediate build failure.
* Never commit real secrets to source control. `.env*` files containing secrets must be kept strictly out of git.

---

### 2. Input Validation
* **Validate every single input with Zod on both the client and the server.**
* Client-side forms must use React Hook Form with `@hookform/resolvers/zod`.
* Server Actions and API Route Handlers must parse/validate all incoming JSON bodies, URL parameters, and headers with corresponding Zod schemas before performing any database or business logic operations.
* Reject unknown or excess fields.

---

### 3. Concurrency & Queue Integrity
* **All token creation and queue state transitions must go through PostgreSQL database functions with transaction locking.**
* Concurrent requests must never result in duplicate token numbers.
* Numbering allocation must lock the daily counter row (`SELECT ... FOR UPDATE` on `daily_counters`).
* Calling the next token must use row locking (`FOR UPDATE SKIP LOCKED`) so multiple staff members cannot be assigned the same token simultaneously.

---

### 4. Database Security & Row Level Security (RLS)
* **Enable Row Level Security (RLS) on every single table.** Default behavior must be DENY.
* Public anonymous access must never directly read or write base tables (`tokens`, `applications`, `audit_log`, `staff_profiles`).
* Public read access is restricted strictly to active services, public announcements, and published templates.
* Token status lookups for students must require the private tracking secret or go through dedicated security-definer functions.
* Staff and Admin roles are verified via `staff_profiles` in the database and never trusted from client-provided headers or claims.

---

### 5. Document & PDF Generation
* **Generate all PDFs strictly on the server.** Never generate official PDFs or certificates inside the client's browser.
* All user text must be sanitized and escaped before rendering into HTML/PDF templates to prevent injection attacks or layout breakage.
* Long names must shrink or wrap safely without overflowing document boundaries.
* Issued certificates must include an atomic reference number, issuance timestamp, and verification QR code linking to `/verify/[reference]`.

---

### 6. Privacy & Data Handling
* **Never log personal data (PII).** Student names, TUF IDs, phone numbers, and emails must never be printed to server console logs, external loggers, or analytics.
* Public display screens (`/display`) must display only token identifiers, service labels, and counters—zero student names, TUF IDs, or application details.
* Verification endpoints (`/verify/[reference]`) must display certificate validity status, issue date, and certificate type only—never student personal details.
