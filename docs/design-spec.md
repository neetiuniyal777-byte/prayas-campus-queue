# Institutional Design Specification: TERNA AUTONOMOUS ENGINEERING COLLEGE

Extracted from User Reference Materials, `public/logo.png`, and Strict Institutional Guidelines.

---

## 1. Color System (Strict Palette & Design Tokens)

All colors are flat, high-contrast, opaque, and government/university standard. Zero gradients, zero glows, zero glassmorphism, zero floating blobs.

| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Header Top Strip Navy** | `#0a1128` / `#0f172a` | Top institutional accreditation line & dark container borders |
| **Primary Institutional Blue** | `#1d4ed8` | Main action buttons, active tabs, primary key indicators, link states |
| **Dark Navy Background** | `#0f172a` | Display kiosk background, sidebar background, table header contrast |
| **Accent Orange** | `#ea580c` / `#f97316` | Attention callouts, token highlights (sampled from logo emblem circle) |
| **Surface Off-White** | `#f8fafc` | Main application background (clean canvas) |
| **Card White** | `#ffffff` | Clean white card surfaces |
| **Divider & Border Line** | `#e2e8f0` | 1px clean crisp borders for all panels, tables, and step indicators |
| **Text Primary** | `#0f172a` | Headings, token numbers, primary table entries |
| **Text Secondary** | `#475569` | Subtitles, field descriptions, metadata |
| **Text Muted** | `#64748b` | Timestamps, table helper labels, footers |
| **Status: Waiting (Amber)** | BG `#fef3c7`, Text `#92400e`, Border `#fde68a` | Tokens waiting in queue |
| **Status: Serving (Blue)** | BG `#dbeafe`, Text `#1e40af`, Border `#bfdbfe` | Token currently at staff counter desk |
| **Status: Called (Green)** | BG `#dcfce7`, Text `#166534`, Border `#bbf7d0` | Token announced to student |
| **Status: Completed (Slate)** | BG `#f1f5f9`, Text `#475569`, Border `#e2e8f0` | Closed service items |
| **Status: Skipped/Denied (Red)** | BG `#fee2e2`, Text `#991b1b`, Border `#fecaca` | Missed/Rejected tokens |

---

## 2. Typography & Hierarchy

- **Font Family**: Inter (via Next.js `next/font/google`).
- **Headings**:
  - H1: `20px` to `24px`, font-bold (`700`), uppercase tracking tight.
  - H2: `16px` to `18px`, font-semibold (`600`).
  - H3: `14px` to `15px`, font-semibold (`600`).
- **Body & Data**:
  - Standard body: `13px` to `14px`, text `#0f172a`.
  - Microcopy / labels: `11px` to `12px`, uppercase, font-bold (`font-bold tracking-wider text-[#64748b]`).
  - Large tokens / Kiosk numbers: `48px` to `72px`, font-mono, font-extrabold (`font-extrabold tracking-widest`).

---

## 3. Structural Elements & Component Rules

### Header (Institutional 2-Tier Bar)
1. **Top Accreditation Strip**:
   - Background: `#0f172a` (Navy) or dark `#0a1128`.
   - Text: `11px`, font-semibold, white/slate-300: `"Affiliated to University of Mumbai | Approved by AICTE | NAAC Accredited"`.
2. **Main Header Bar**:
   - Background: White (`#ffffff`), bottom border 1px `#e2e8f0`.
   - Left: `public/logo.png` (height 48px, crisp object-contain) + Institutional title `"TERNA AUTONOMOUS ENGINEERING COLLEGE"` with subtitle `"Office of Student Services & Administration"`.
   - Right: Active navigation links (`Services`, `Track Token`, `Display Kiosk`, `Staff Portal`).

### Student Home Page
1. **Solid Stat Band**:
   - Flat background (`#1e293b` or `#0f172a`), crisp white text.
   - Title: `"Get your digital token"` + one-line subtitle: `"Scan QR, pick your administrative service, and track your queue position in real time."`
   - Three live counter numbers with 1px border cards:
     - `Now Serving` (e.g. `B-014`)
     - `Waiting in Queue` (e.g. `8 Students`)
     - `Average Wait Time` (e.g. `~5 mins`)
2. **4-Step Workflow Strip**:
   - 1px border horizontal strip with numbered badges:
     - `1. Scan QR`
     - `2. Select Service`
     - `3. Get Token`
     - `4. Track & Collect`
3. **Service Directory Cards**:
   - 1px border `#e2e8f0`, white background, 6px border-radius.
   - Prefix badge (`B`, `F`, `Q`, `E`, `D`, `M`), service title, description, estimated wait time badge, and status (`Open` or `Paused`).

### Form / Apply Page
- 4-step linear stepper header (`1. Details -> 2. Form Fields -> 3. Documents -> 4. Review`).
- Two-column desktop split: Left = Form inputs with crisp 1px borders, labels, and validation. Right = Live filled PDF preview panel with zoom and download buttons.

### Token Tracking Page (`/token/[trackingId]`)
- Centered prominent token card:
  - Very large token code display (`B-001`, `text-6xl font-mono font-extrabold`).
  - Status pill badge (`Waiting`, `Called to Counter 1`, `Serving`, `Completed`).
  - Key metric tiles: `Now Serving`, `People Ahead`, `Estimated Wait`.
  - Queue progress bar (flat royal blue fill `#1d4ed8`).
  - Live milestone timeline.
  - Action buttons: `Download Filled Application Form`, `Share Tracking Link`.

### Staff Dashboard (`/staff`)
- Left sidebar: Logo + College name + staff role badge + navigation links.
- Top action bar: Current date/time, staff identity, active counter selector, and a green live pulsation dot (`● Supabase Realtime Active`).
- 4 Stat tiles: `Now Serving`, `Waiting Ahead`, `Completed Today`, `Average Time`.
- Big Call Next & Counter Action Panel:
  - `Call Next Token` (Large solid `#1d4ed8` button).
  - Desk control buttons: `Complete`, `Skip (No-show)`, `Recall Chime`.
- Compact Waiting Queue Table:
  - Sticky header, 1px row dividers, compact padding (`py-2.5 px-3`), status pill badges, actions.

### Display Kiosk (`/display`)
- High-visibility dark theme (`#090d16` and `#0f172a`).
- Giant Now-Serving card readable from 10 meters.
- Secondary columns for Next 3 tokens and counter assignments.
- Bottom announcement ticker.

---

## 4. Banned vs Required

- **Banned**: Gradients, blurred glassmorphism, floating colorful blobs, rounded pill card shapes, emoji icons, empty heroes with marketing illustrations.
- **Required**: Flat solid colors, 1px `#e2e8f0` borders, 6-8px border radius, Inter font typography, Lucide React icons, mobile-first tested down to 360px without horizontal overflow.
