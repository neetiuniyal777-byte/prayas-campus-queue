# Terna Autonomous Engineering College - Digital Token & Form Generation System

A secure, institutional QR-based administrative queue token and automated certificate generation platform designed for **Terna Autonomous Engineering College**.

Students scan an administrative office QR code, select an administrative service, input student credentials once, generate official university format application forms as print-ready PDFs, and track their position in line live on their mobile devices. Administrative staff manage queues, verify documents, and issue signed certificates with cryptographic QR verification codes.

---

## 1. System Architecture & Tech Stack

* **Frontend & Server Logic**: Next.js 14.2.35 (App Router, Server Actions, Route Handlers) + TypeScript
* **Styling & Design System**: Tailwind CSS (Institutional design tokens, 1px defined borders, flat solid colors matching reference specifications)
* **Backend & Database**: Supabase PostgreSQL (Row Level Security on all tables, atomic transaction locking via security-definer functions)
* **Authentication**: Supabase Auth (Staff & Admin role-based authorization)
* **Realtime Synchronization**: Supabase Realtime channels with graceful client polling fallback
* **PDF & Document Engine**: `pdf-lib` (Server-only rendering with official institutional headers and logo embedding)
* **QR Codes**: `qrcode` library for verification URLs and printable high-res posters

---

## 2. Environment Variables

Create `.env.local` in the project root:

```env
# Public Supabase credentials (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-Only Secret (NEVER exposed to frontend bundle)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

---

## 3. Step-by-Step Vercel Deployment Guide

Follow these exact steps to deploy to production on Vercel:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete administrative queue and token platform"
   git push origin main
   ```

2. **Open Vercel Dashboard**:
   * Navigate to [https://vercel.com](https://vercel.com) and log in.
   * Click the **"Add New..."** button and select **"Project"**.
   * Choose your GitHub repository (`prayas-campus-queue`).

3. **Configure Build Settings**:
   * **Framework Preset**: Next.js
   * **Root Directory**: `./` (leave default)

4. **Add Environment Variables**:
   Under **Environment Variables**, expand the panel and add:
   * `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
   * `SUPABASE_SERVICE_ROLE_KEY` = your Supabase Service-Role Secret Key
   * `NEXT_PUBLIC_APP_URL` = `https://your-project-name.vercel.app`

5. **Deploy**:
   * Click **"Deploy"**. Vercel will build and assign a production URL.
   * Open `/admin/qr` on your production URL to print the official office QR posters.

---

## 4. Administrative Verification Checklist

* [x] **Home Catalogue**: Browse services at `/` with live counter wait estimates.
* [x] **Blank Forms**: Download official blank PDFs at `/service/[slug]`.
* [x] **4-Step Apply**: Complete details, service fields, document attachment, and live PDF preview at `/service/[slug]/apply`.
* [x] **Token Tracking**: Track live queue position and counter announcements at `/token/[trackingId]`.
* [x] **Staff Desk**: Manage calls, completions, skips, and pauses at `/staff`.
* [x] **Split Review**: Scrutinize applications alongside auto-filled PDFs at `/staff/requests/[id]`.
* [x] **Certificate Issuance**: Issue verified certificates with QR codes.
* [x] **Public Kiosk Display**: View high-contrast dark theme board at `/display`.
* [x] **Printable Posters**: Generate high-res QR posters at `/admin/qr`.
