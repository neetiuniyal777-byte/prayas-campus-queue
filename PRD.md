---
title: "QR-Based Digital Token System: Product Requirements Document"
subtitle: "Campus Administration Queue and Certificate Service Platform"
---

**Version 1.1 | Build tool: Antigravity | Submission deadline: 12 October 2026, 11:59 PM**

# 1. Overview

## 1.1 Problem

Students spend 15 to 30 minutes or more waiting in administrative offices for services such as bonafide certificates, fee queries, examination forms and document verification. There is no real-time queue visibility, which causes crowding, uncertainty, repeated visits and wasted time for both students and staff.

## 1.2 Solution

A web platform where a student scans a QR code at the office, chooses a service, enters their details once (name, class, branch, TUF ID), and the system automatically generates the correct application form or certificate request as a ready-to-print PDF in the official college format. The student submits it digitally and receives a token. The student tracks the live queue from their phone and arrives only when their turn is near. Staff manage the queue and review submitted requests from a secure dashboard. A public display screen shows the current and next tokens.

## 1.3 Goals

- Cut physical waiting time and crowding in the office.
- Make the student journey fully digital: scan, choose, fill, submit, track, collect.
- Auto-generate every form and certificate from the student's details, so nobody writes anything by hand.
- Give staff one dashboard for queue control and request review.
- Remain secure: no duplicate tokens, no unauthorized staff actions, no personal data on public screens.

## 1.4 Non-goals (version 1)

- Online payments.
- Native mobile apps (the site is a mobile-first web app).
- SMS or WhatsApp notifications (stretch).
- Integration with the college ERP.

## 1.5 Success metrics

- A student gets a token in under 30 seconds from scanning the QR code.
- Zero duplicate token numbers under simultaneous requests.
- Queue status updates on student and display screens within 2 seconds of a staff action.
- A student enters name, class, branch and TUF ID once and gets a correctly filled form PDF in under 5 seconds.

# 2. Users and Roles

| Role | Description | Access |
|---|---|---|
| Student (guest) | Any student scanning the QR code. No account needed in v1. | Issue a token, track own token, generate and submit forms, download own documents via private link |
| Staff | Administrative office employee assigned to one or more services and counters | Staff dashboard for assigned services, queue actions, review requests |
| Admin | Office head or project owner | Everything staff can do, plus manage services, counters, form templates, staff accounts, announcements and analytics |
| Public display | A screen in the office, no login, read-only | Safe queue data only: token numbers, service names, counters, announcements |

# 3. Student User Journey

1. Student scans the office QR code and lands on the home page (no app install, no login).
2. Student sees the list of services with live status (open, paused, current wait).
3. Student selects a service, for example Bonafide Certificate.
4. The system shows what is required: documents to bring, fee if any, expected processing time.
5. Student enters or confirms their details: full name, class, branch, TUF ID and the purpose or extra fields that service needs.
6. The system instantly generates the form in the official format with the details filled in. The student previews it and can download the filled PDF, or download the blank form to fill by hand.
7. Student uploads any supporting documents (photo or PDF of ID card, fee receipt).
8. Student reviews a summary and submits.
9. System issues a digital token linked to the submitted request, and shows token number, queue position and estimated wait.
10. Student keeps the tracking page open or saves the private link. The page updates live.
11. When the token is called, the page alerts the student with the counter number.
12. At the counter, staff verify the original documents, approve the request, and issue the signed certificate.
13. Student downloads the issued certificate from the tracking page when it is ready, and can rate the experience.

# 4. Feature List

Priority key: P0 = must ship for the submission, P1 = should ship, P2 = stretch if time remains.

## 4.1 Student features

| ID | Feature | Priority | Description |
|---|---|---|---|
| S1 | QR entry | P0 | One QR code per office (optionally one per service) opens the mobile-first home page. |
| S2 | Service catalogue | P0 | Cards for each service with name, description, status, and current wait. |
| S3 | Instant digital token | P0 | Unique token per service per day, for example B-014. |
| S4 | Live token tracking | P0 | Status (waiting, called, serving, completed, skipped), queue position, now serving, estimated wait. |
| S5 | Downloadable blank forms | P0 | Each service has the official blank form as PDF, downloadable before visiting. |
| S6 | Student details profile | P0 | Student enters name, class, branch and TUF ID once. All forms use it. |
| S7 | Auto-generated filled form | P0 | System places the student's details onto the official form format and returns a print-ready PDF instantly. |
| S8 | Live form preview | P0 | Student sees the filled form on screen before submitting, and can edit details. |
| S9 | Submit request with token | P0 | Submission creates an application record and issues a token in one step. |
| S10 | Multiple certificate types | P0 | Bonafide, fee certificate, exam form correction, document verification, duplicate marksheet, and others, all from one form engine. |
| S11 | Document upload | P1 | Upload supporting files (image or PDF, size and type limited) to private storage. |
| S12 | Requirement checklist | P1 | Per service list of documents and fees needed, shown before the form. |
| S13 | Save details on device | P1 | Details saved in the browser to pre-fill future forms. |
| S14 | Application status timeline | P0 | Submitted, under review, needs correction, approved, ready for collection, completed. |
| S15 | Correction requests | P1 | If staff reject a field or document, the student sees the reason and can fix and resubmit without a new token if still the same day. |
| S16 | Download issued certificate | P0 | Approved certificate downloadable as PDF from the private tracking link. |
| S17 | Turn alerts | P1 | In-page banner, sound and vibration when the token is called, plus a warning when 3 tokens remain. |
| S18 | Cancel or rejoin | P1 | Student can cancel a token. Late students can rejoin once. |
| S19 | Recover my token | P1 | Look up active token with TUF ID plus token number if the link is lost. |
| S20 | Multilingual interface | P2 | English plus Hindi and Marathi toggle. |
| S21 | Installable web app | P2 | PWA so the site can be added to the home screen. |
| S22 | Feedback rating | P2 | One to five stars and optional comment after completion. |
| S23 | Accessibility | P1 | Large tap targets, high contrast, screen reader labels. |

## 4.2 Staff features

| ID | Feature | Priority | Description |
|---|---|---|---|
| T1 | Secure sign-in | P0 | Email and password via Supabase Auth. |
| T2 | Role and service scoping | P0 | Staff see and act only on services assigned to them. |
| T3 | Live waiting list | P0 | Waiting tokens in order, with service, wait time so far, and request status. |
| T4 | Call next | P0 | One click calls the next waiting token to the staff member's counter. |
| T5 | Recall | P1 | Re-announce the current token. |
| T6 | Complete, skip, no-show | P0 | Close the current token with a reason when skipped. |
| T7 | Pause and resume service | P0 | Pausing stops new tokens and shows a banner to students. |
| T8 | Review application | P0 | View submitted data, filled PDF and uploaded documents side by side. |
| T9 | Approve, reject, request correction | P1 | With a reason message shown to the student. |
| T10 | Generate issued certificate | P0 | One click generates the final certificate PDF from the approved data in the official format, with date, reference number and QR verification code. Staff then sign and stamp it. |
| T11 | Counter selection | P1 | Staff pick which counter they are serving from. |
| T12 | Manual token | P1 | Issue a token for a walk-in student without a phone. |
| T13 | Daily stats | P1 | Served, skipped, average service time, current wait. |
| T14 | Search | P2 | Find a request by token, TUF ID or name. |

## 4.3 Admin features

| ID | Feature | Priority | Description |
|---|---|---|---|
| A1 | Manage services | P0 | Create, edit, activate, deactivate services and token prefixes. |
| A2 | Manage counters | P0 | Create counters and assign services. |
| A3 | Manage staff | P0 | Create staff accounts, assign roles and services. |
| A4 | Manage form and certificate templates | P0 | Edit template text, fields and layout, publish new versions, upload college logo and signature image. |
| A5 | Announcements | P1 | Short messages shown on the display and student home page. |
| A6 | Office hours and capacity | P1 | Opening hours, daily token cap per service, break periods. |
| A7 | Analytics | P2 | Busiest hours, average wait, average service time, per-service load. |
| A8 | Audit log view | P1 | Who did what and when. |
| A9 | QR generator | P0 | Generate and download printable QR posters per office or service. |
| A10 | Daily reset | P0 | Token numbering restarts each day automatically. |

## 4.4 Public display features

| ID | Feature | Priority | Description |
|---|---|---|---|
| D1 | Now serving board | P0 | Large current token per counter with counter number. |
| D2 | Next tokens | P0 | Next three waiting tokens per service. |
| D3 | Live auto-update | P0 | No manual refresh; reconnects automatically after network loss. |
| D4 | Announcements ticker | P1 | Scrolling messages from admin. |
| D5 | Call sound and highlight | P1 | Chime and flash when a new token is called. |
| D6 | Privacy | P0 | Never shows names, TUF IDs or request details. |
| D7 | Full-screen kiosk mode | P1 | Large type, dark theme, readable from a distance. |

# 5. Functional Requirements

## 5.1 Token rules

- Format is the service prefix plus a zero-padded number, for example B-001.
- Numbering is per service per calendar day in the college time zone (Asia/Kolkata).
- Numbers are allocated inside a database function using a locked counter row, so concurrent requests can never receive the same number.
- A student can hold only one active token per service at a time (enforced by TUF ID plus service plus date).
- Status flow: waiting, called, serving, completed. Side exits: skipped, cancelled, no_show.
- Unclaimed called tokens become no_show after a configurable timeout (default 5 minutes) unless staff recall.

## 5.2 Estimated wait

- Estimated wait equals the number of waiting tokens ahead multiplied by the average service duration for that service.
- Average duration is computed from the last 20 completed tokens for the service on recent days. If no history exists, use the default duration configured on the service (for example 5 minutes).

## 5.3 Form and certificate generation

This is the core of the certificate feature. Every college certificate or request has a fixed format. The system stores that format as a template and fills it automatically.

**How it works**

1. Student enters the common details once: full name, class (for example TE, SE, BE), branch, and TUF ID. These are saved as the student profile for the session.
2. Student picks a service. The service may ask for a few extra fields (for example purpose of certificate, academic year, subject codes).
3. The server takes the template for that service, merges the student's details into it, and renders a PDF in the official format.
4. The same engine produces two documents: the **Application Form** (what the student submits to the office) and the **Issued Certificate** (what the office gives back after approval).
5. Both are stored in private storage and linked to the application. The student can download the application immediately and the certificate once approved.

**Common fields (collected once)**

| Field key | Label | Type | Validation |
|---|---|---|---|
| full_name | Full name (as per college records) | text | Required, letters and spaces, 3 to 80 characters |
| class_year | Class | dropdown | FE, SE, TE, BE (configurable) |
| branch | Branch | dropdown | List managed by admin |
| tuf_id | TUF ID | text | Required, pattern configurable by admin, unique per student per day per service |
| division | Division or roll number | text | Optional |
| academic_year | Academic year | dropdown | For example 2026-27 |
| email | Email | email | Optional, used only for contact on the request |
| phone | Phone | text | Optional, 10 digits |

**Service specific fields and templates**

| Service | Extra fields | Application form output | Issued document |
|---|---|---|---|
| Bonafide Certificate | Purpose (scholarship, passport, bank, other), number of copies | Application letter to the Principal or Registrar with student details and purpose | Bonafide certificate stating the student is a bonafide student of the given class, branch and year, with reference number, date, signature block and seal area |
| Fee Certificate | Fee type, academic year, receipt number | Request for fee certificate | Fee certificate with amounts, receipt references and date |
| Fee Query | Query category, description | Fee query form | Acknowledgement slip with token and reference number |
| Exam Form Correction | Exam session, seat number, field to correct, correct value | Correction request form | Acknowledgement slip |
| Document Verification | Document type, issuing body, purpose, number of documents | Verification request form | Verification acknowledgement or letter |
| Duplicate Marksheet or Transcript | Semester, reason (lost, damaged), number of copies | Request form with declaration | Acknowledgement slip |
| Character or Conduct Certificate | Purpose | Application letter | Character certificate |
| No Objection Certificate | Purpose, organization name, dates | Application letter | NOC |

**Template engine requirements**

- A template is a document definition with fixed text, placeholders like {{full_name}}, {{class_year}}, {{branch}}, {{tuf_id}}, a header block (college name, logo, address), a footer (signature lines, seal area, reference number) and page size A4.
- Templates are versioned. An application always records which version it used, so reprints are identical.
- Admin can edit the wording and header, and upload a logo and signature image, without code changes.
- The college's real format must be copied exactly. Collect the actual forms from the office (photo or PDF) and set up each as a template.
- Every issued certificate carries a reference number (for example BON/2026/000123), issue date, and a QR code linking to a verification page that confirms authenticity without showing private data.
- Text is escaped before rendering so special characters cannot break the PDF.
- Long names wrap or shrink to fit the field.
- Rendering runs on the server. Generation must take under 3 seconds.

**Two ways to produce a PDF**

- **Option A (recommended for the deadline):** Render templates with HTML and CSS to PDF on the server (for example using a headless browser or a PDF library such as pdf-lib or react-pdf). Templates are code and database text, easy for Antigravity to generate and easy to edit.
- **Option B:** Overlay text on the college's scanned or designed PDF at fixed coordinates using pdf-lib. Best when the office insists on its exact printed layout, but needs careful coordinate setup per form.

**Validation and editing**

- Fields are validated in the browser and again on the server.
- A submitted application is immutable except through a correction request, which creates a new revision and regenerates the PDF.

## 5.4 Real-time behaviour

- Student tracking page, staff dashboard and display receive updates via Supabase Realtime.
- If the realtime connection drops, the client falls back to polling every 5 seconds and shows a small connection indicator.

## 5.5 Edge cases to handle

- Student closes the page: the private link restores the token.
- Service paused or office closed: token issuing disabled with a clear message.
- Two staff click Call Next together: each gets a different token, never the same one.
- Student scans the QR code from home: allow token issuing only during office hours; optional on-site code is a P2.
- Staff leaves a token in serving for too long: warn after a configurable limit.
- Wrong spelling of the name: student can edit before submitting; staff can request a correction after.

# 6. Non-Functional Requirements

- Performance: first page load under 3 seconds on a 4G phone. Queue actions respond in under 1 second. PDF generation under 3 seconds.
- Reliability: handle at least 200 tokens per day across services and 50 concurrent live viewers.
- Usability: mobile-first, usable one-handed, no mandatory sign-up for students.
- Security: described in section 9.
- Privacy: collect only data needed for the service; delete uploaded documents after a retention period (default 90 days, configurable).
- Browser support: latest Chrome, Safari, Edge, Firefox on mobile and desktop.
- Accessibility: WCAG 2.1 AA targets for contrast and labels.

# 7. System Architecture

## 7.1 Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend and server logic | Next.js (App Router) + TypeScript | Pages, route handlers and server actions |
| Styling | Tailwind CSS + shadcn/ui components | Fast, consistent, accessible UI |
| Forms | React Hook Form + Zod | Client and server validation from one schema |
| Database | Supabase PostgreSQL | Data, functions, row level security |
| Auth | Supabase Auth | Staff and admin sign-in |
| Realtime | Supabase Realtime | Live queue updates |
| File storage | Supabase Storage (private buckets) | Templates, uploads, generated PDFs |
| PDF generation | pdf-lib or react-pdf | Application forms and certificates |
| QR codes | qrcode library | Office posters and certificate verification codes |
| Hosting | Vercel | Public deployment over HTTPS |
| Source control | GitHub | Version history, Vercel deployment trigger |

## 7.2 High-level flow

Student phone, staff browser and display screen all talk to the Next.js app on Vercel. The Next.js server talks to Supabase. Public queue reads use safe views or functions. All writes go through server code or security-definer database functions. Realtime channels broadcast only non-sensitive queue state. PDF generation runs only on the server.

## 7.3 Principles

- All token allocation and queue transitions are database functions executed in one transaction.
- The browser never holds a service-role key. The service-role key exists only in server environment variables on Vercel.
- Public pages read from a minimal public view, never directly from base tables.

# 8. Frontend Specification

## 8.1 Pages and routes

| Route | Audience | Purpose |
|---|---|---|
| / | Student | Home: service list, live status, announcements |
| /service/[slug] | Student | Service details, checklist, blank form download, Start request button |
| /service/[slug]/apply | Student | Multi-step: details (name, class, branch, TUF ID), service fields, live form preview, uploads, review, submit |
| /token/[trackingId] | Student | Live token page with position, wait, status, application timeline, downloads |
| /verify/[reference] | Public | Certificate authenticity check (shows valid or invalid, issue date, type, no private data) |
| /recover | Student | Find an active token with TUF ID and token number |
| /display | Public screen | Full-screen now serving board |
| /staff/login | Staff | Sign in |
| /staff | Staff | Dashboard: live queue, call next, complete, skip, pause, counter picker |
| /staff/requests/[id] | Staff | Application review with PDF preview, documents, approve and issue |
| /admin | Admin | Overview and analytics |
| /admin/services | Admin | Manage services and counters |
| /admin/templates | Admin | Manage form and certificate templates, logo, signature |
| /admin/staff | Admin | Manage staff accounts |
| /admin/qr | Admin | Generate QR posters |

## 8.2 Key components

ServiceCard, TokenCard, QueueProgressBar, StatusBadge, StepperForm, DynamicFormRenderer (builds the form from the field definition), FormPreview (shows the generated PDF), FileUploader, PdfViewer, LiveNowServing, CounterBoard, AnnouncementTicker, ConnectionIndicator, ConfirmDialog.

## 8.3 UX rules

- Mobile-first layout with a single primary action per screen.
- Token number displayed very large with status colour (waiting amber, called green, completed grey, skipped red).
- Progress indicator on multi-step forms with the ability to go back without losing data.
- The form preview updates as the student types, so they can spot mistakes before submitting.
- Clear error messages next to the field. Never show raw errors from the server.
- Loading skeletons and empty states for every list.
- Display screen uses a dark theme, very large type, and no interactive controls.

## 8.4 State and data fetching

- Server components for initial data. Client components subscribe to realtime channels for live updates.
- Form state in React Hook Form, validated by shared Zod schemas.

# 9. Backend Specification

## 9.1 API surface (Next.js route handlers or server actions)

| Endpoint | Method | Who | Description |
|---|---|---|---|
| /api/services | GET | Public | Active services with status and wait estimate |
| /api/services/[slug]/template | GET | Public | Published template fields for the service |
| /api/forms/[serviceSlug]/blank | GET | Public | Download blank form PDF |
| /api/forms/[serviceSlug]/preview | POST | Public, rate limited | Validate details and return a filled preview PDF (not stored) |
| /api/applications | POST | Public, rate limited | Validate, store application, generate PDF, issue token, return tracking link |
| /api/uploads | POST | Public, rate limited | Upload a supporting file after type and size checks |
| /api/tokens/[trackingId] | GET | Holder of link | Token status, position, wait, application timeline |
| /api/tokens/[trackingId]/cancel | POST | Holder of link | Cancel own token |
| /api/tokens/[trackingId]/documents/[docId] | GET | Holder of link | Signed URL for own document or certificate |
| /api/verify/[reference] | GET | Public, rate limited | Certificate authenticity result |
| /api/recover | POST | Public, rate limited | Recover tracking link by TUF ID and token |
| /api/display/state | GET | Public | Safe queue state for the display |
| /api/staff/queue | GET | Staff | Waiting list for assigned services |
| /api/staff/call-next | POST | Staff | Call next token for a counter |
| /api/staff/tokens/[id]/status | POST | Staff | Serving, completed, skipped, no_show |
| /api/staff/services/[id]/pause | POST | Staff | Pause or resume |
| /api/staff/applications/[id]/review | POST | Staff | Approve, reject, request correction |
| /api/staff/applications/[id]/issue | POST | Staff | Generate the issued certificate PDF with reference number |
| /api/admin/* | CRUD | Admin | Services, counters, templates, staff, announcements |

## 9.2 Core database functions

- issue_token(service_id, tuf_id, application_payload): checks service is open, checks duplicate active token, locks the daily counter row, increments, inserts the token and application, writes a token event, returns token number and tracking secret.
- call_next(service_id, counter_id): selects the oldest waiting token using row locking with skip locked, marks it called, assigns the counter, writes an event.
- set_token_status(token_id, new_status, reason): validates the allowed transition and the staff member's service assignment.
- get_token_status(tracking_secret): returns the status, position and estimated wait for one token only.
- get_public_queue_state(): returns current and next tokens only.
- next_reference_number(doc_type, year): allocates unique certificate reference numbers atomically.
- expire_called_tokens(): marks unclaimed called tokens as no_show. Run on a schedule.

## 9.3 Security requirements

1. Row Level Security is enabled on every table. Default is deny. Policies are written and then tested for both allowed and denied access.
2. Staff and admin roles are stored in a staff_profiles table and checked in policies and in server code. Role is never trusted from the client.
3. Students use an unguessable tracking secret (at least 128 bits of randomness). Only a hash is stored in the database. Possession of the link grants access to that single token.
4. The service-role key and any secret live only in server environment variables. Never prefix them as public.
5. Input validation with Zod on every endpoint. Reject unknown fields. Escape text before storing and when rendering PDFs.
6. Rate limiting on token issuing, preview, upload, verify and recover endpoints (per IP and per TUF ID). Optional CAPTCHA if abuse appears.
7. File uploads: allow only PDF, JPG, PNG; maximum 5 MB; random file names; stored in private buckets; accessed only through short-lived signed URLs.
8. Security headers (content security policy, HSTS, no-sniff, frame denial) configured in Next.js.
9. The public display endpoint exposes only token numbers, service names, counter labels and announcements.
10. The verify endpoint returns only validity, certificate type and issue date.
11. Every staff and admin action writes to an audit log.
12. Brute-force protection and session expiry for staff login. Admin accounts created only by an admin.
13. Do not log personal data.

# 10. Database Design

## 10.1 Tables

| Table | Key columns | Notes |
|---|---|---|
| staff_profiles | id (references auth user), full_name, role (staff or admin), is_active | Role source of truth |
| services | id, name, slug, prefix, description, default_duration_min, status (open, paused, closed), daily_cap, requires_form, instructions, sort_order, is_active | Prefix used in token labels |
| counters | id, label, is_active | Physical counters |
| counter_services | counter_id, service_id | Which counter serves what |
| staff_services | staff_id, service_id | Staff to service assignment |
| office_hours | id, weekday, open_time, close_time | Optional per service |
| daily_counters | service_id, service_date, last_number | Primary key (service_id, service_date). Locked on issue |
| tokens | id, service_id, service_date, number, label, tuf_id, student_name, status, tracking_hash, counter_id, issued_at, called_at, started_at, completed_at, application_id | Unique (service_id, service_date, number) |
| token_events | id, token_id, from_status, to_status, actor_type, actor_id, reason, created_at | Full history for analytics |
| document_templates | id, service_id, kind (application or certificate), title, version, body (structured content with placeholders), header_json, footer_json, blank_pdf_path, is_published, created_at | Versioned templates |
| template_fields | id, template_id, key, label, type, required, options, validation, sort_order | Drives form UI |
| students_lookup (optional) | tuf_id, full_name, class_year, branch | Optional pre-loaded list so details can be verified or auto-completed |
| applications | id, service_id, template_id, template_version, student_name, tuf_id, class_year, branch, division, academic_year, email, phone, data (jsonb), status, review_note, application_pdf_path, certificate_pdf_path, reference_number, issued_at, created_at, updated_at | One per submission |
| application_revisions | id, application_id, data (jsonb), created_at | Correction history |
| application_documents | id, application_id, file_path, file_name, mime_type, size_bytes, uploaded_at | Private storage references |
| reference_counters | doc_type, year, last_number | Atomic certificate numbering |
| announcements | id, message, is_active, starts_at, ends_at | Display and home page |
| feedback | id, token_id, rating, comment, created_at | Stretch |
| audit_log | id, actor_id, action, entity_type, entity_id, details (jsonb), created_at | Admin visible |
| rate_limits | key, window_start, count | If rate limiting is stored in the database |

## 10.2 Relationships

- A service has many tokens, templates and counters through counter_services.
- A token optionally links to one application. An application has many documents and revisions.
- Staff are assigned to services through staff_services.

## 10.3 Indexes and constraints

- Index tokens on (service_id, service_date, status, number) for queue queries.
- Unique partial index to prevent two active tokens for the same TUF ID and service on the same day.
- Unique index on applications.reference_number.
- Check constraints on status values and allowed role values.
- Foreign keys with sensible delete rules (restrict for services in use).

## 10.4 Row Level Security summary

| Table | Public | Staff | Admin |
|---|---|---|---|
| services, announcements | Read active rows | Read | Full |
| document_templates, template_fields | Read published | Read | Full |
| tokens, applications, documents | None directly (use functions with tracking secret) | Read and update for assigned services | Full |
| token_events | None | Read assigned services | Full |
| staff_profiles, staff_services, counters | None | Read own | Full |
| audit_log | None | None | Read |

## 10.5 Storage buckets

- templates (private, admin write; blank forms served only through the blank download endpoint).
- student-uploads (private, writes through server only, read by staff and by the token holder via signed URL).
- generated-documents (private, same access rule as uploads).
- branding (logo, signature, seal images; admin write).

# 11. Antigravity Build Plan

Antigravity writes the code, so the quality of your instructions decides the result. Work in small phases, test each one, and commit to GitHub after every working phase.

## 11.1 Setup tips

- Put this PRD into the project as PRD.md and tell the agent to read it before every task.
- Create a short RULES.md containing: use Next.js App Router and TypeScript; never expose secrets; validate every input with Zod; all queue changes go through database functions; follow the RLS table in this PRD; generate PDFs on the server only.
- Ask the agent to produce a plan first, review it, then let it implement.
- After each phase, ask the agent to run the app, fix errors and write a short test checklist.
- Never paste real student data or keys into prompts.
- Bring the real forms: take clear photos or PDFs of the actual Bonafide and other forms from the office and give them to the agent as the layout reference.

## 11.2 Phases

| Phase | Goal | Done when |
|---|---|---|
| 0 | Create Next.js project, GitHub repo, Supabase project, env files | App runs locally and connects to Supabase |
| 1 | Database schema, seed data, RLS policies, issue_token and call_next functions | Two simultaneous issue_token calls give different numbers; anonymous users cannot read tokens |
| 2 | Service list and token issuing without forms | Student gets a token and sees live status |
| 3 | Staff login, dashboard, call next, complete, skip, pause | Staff action updates the student page live |
| 4 | Public display screen | Display updates automatically and shows no personal data |
| 5 | Form engine: details step, live preview, filled application PDF, blank form download, submit with token (Bonafide first) | Student enters name, class, branch, TUF ID and gets a correct Bonafide application PDF and a token |
| 6 | Staff review, approve, generate issued certificate with reference number and QR, student download, verify page | Staff approve and the student downloads the certificate; verify page confirms it |
| 7 | Remaining templates (fee, exam correction, verification, duplicate marksheet) as seed data | All listed services produce correct PDFs |
| 8 | Admin pages, QR generator, announcements, daily reset, template editing | Admin creates a service and prints a QR poster |
| 9 | Security hardening, rate limits, error handling, mobile polish | Security checklist in section 12 passes |
| 10 | Deploy to Vercel, production env variables, final QR codes, demo script | Public URL works from a phone using the printed QR |

## 11.3 Suggested two-day schedule

- Day 1 (10 Oct): Phases 0 to 4, then start phase 5 with the Bonafide form.
- Day 2 (11 Oct): Finish phases 5 and 6, add one or two more templates from phase 7, phase 8 essentials (QR generator), phase 9 checks, phase 10 deployment.
- 12 Oct (before 11:59 PM): Buffer for fixes, screenshots, demo video and submission write-up. Do not start new features.

## 11.4 Sample first prompts for Antigravity

1. Read PRD.md fully. Propose a project structure, then create a Next.js TypeScript Tailwind project with Supabase client setup using environment variables. Do not implement features yet.
2. Using section 10 of PRD.md, write the Supabase SQL migration for all P0 tables, indexes and constraints, plus seed data for five services and three counters.
3. Write the issue_token and call_next Postgres functions as described in section 9.2, with locking so concurrent calls cannot produce duplicate numbers. Then write a test script that fires 50 simultaneous requests and verifies all numbers are unique.
4. Enable RLS on all tables and implement the policy table in section 10.4. Write tests proving anonymous users cannot read tokens or applications and staff cannot access unassigned services.
5. Using section 5.3, build the form engine: a document_templates seed for the Bonafide application and certificate, a server route that merges full name, class, branch and TUF ID into the template and returns an A4 PDF, and a live preview in the apply page. Use the attached photo of the real form as the layout reference.
6. Add the staff approve and issue flow: generate the certificate PDF with an atomic reference number, a QR code that links to /verify/[reference], and a public verify page that shows only validity, type and date.

# 12. Testing and Acceptance

## 12.1 Acceptance criteria for the P0 build

- Scanning the QR code on a phone opens the home page over HTTPS.
- A student can enter name, class, branch and TUF ID, see the filled form, submit it and get a unique token.
- The student can download the blank form and the filled application PDF.
- Staff can approve and issue a certificate; the student can download it.
- The tracking page updates live when staff call, complete or skip.
- The display shows the current and next tokens without any personal data.
- Staff can sign in, call next, complete, skip and pause a service. Unauthenticated users cannot.
- Staff cannot act on services they are not assigned to.
- Token numbers reset each day.

## 12.2 Security checklist

- Anonymous requests to base tables return nothing.
- A student cannot open another student's tracking link or documents by changing the URL.
- Service-role key not present in any browser bundle (search the build output).
- Upload of an executable or oversized file is rejected.
- Fifty rapid token requests from one IP trigger rate limiting.
- Calling staff endpoints without a session returns 401, and with the wrong role returns 403.
- Script injection or very long text in form fields is rendered harmlessly in PDFs.
- The verify page leaks no personal data.

## 12.3 Test scenarios

- Concurrency: 50 simultaneous token requests.
- Two staff members press Call Next at once.
- Student refreshes, closes and reopens the tracking link.
- Network drop on the display and recovery.
- Paused service, closed office, daily cap reached.
- Names with special characters or very long names in the PDF.
- Mobile layouts on small and large phones.

# 13. Deployment

- Push code to GitHub and import the repository into Vercel.
- Add environment variables in Vercel: Supabase URL, anon key (public), service-role key (server only), app base URL.
- Run the database migration on the production Supabase project and create the first admin user manually.
- Configure a cron job for expiring called tokens and daily housekeeping.
- Generate QR codes pointing to the production URL and print them as posters.
- Keep a rollback option: every phase is a Git commit that can be redeployed.

# 14. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Only two days to build | Strict P0 scope, Bonafide first, other forms are seed data using the same engine |
| Official form layout not matched | Get the real forms from the office early and use them as the layout reference |
| AI-generated code with security gaps | Rules file, RLS tests, security checklist before deployment |
| Duplicate tokens | Database-level locking and unique constraint, with a concurrency test |
| Misuse by remote scanning or spam | Rate limits, office-hours check, optional on-site code |
| Fake certificates | Reference numbers plus QR verification page |
| Free tier limits | Keep data small, avoid heavy media, monitor usage |
| Demo-day network failure | Prepare a recorded demo video and screenshots as backup |

# 15. Future Scope

- SMS or WhatsApp turn alerts.
- Student login with college email and request history.
- Digital signature on certificates.
- Online fee payment.
- Predictive wait time using historical patterns.
- Multi-campus and multi-department support.
- Voice announcements on the display.

# 16. Glossary

- Token: a numbered place in a service queue for one day.
- Tracking link: the private URL that lets a student view their own token.
- TUF ID: the student's college identification number.
- Template: the stored format of a form or certificate with placeholders for student details.
- RLS: Row Level Security, database rules that decide which rows each user can read or change.
- Realtime: instant pushing of database changes to open pages.
- PRD: Product Requirements Document.
