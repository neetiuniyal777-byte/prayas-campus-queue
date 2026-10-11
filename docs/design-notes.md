# Design System & Reference Extraction Notes

Extracted directly from the official reference workflow diagram (`Campus Queue QR Token Workflow.png`) and the institutional Terna Engineering logo (`public/logo.png`).

---

## 1. Color Palette (Sampled Hex Values)

* **Primary Royal Blue**: `#1d4ed8` / `#2563eb` (Brand color from Terna logo & primary action buttons)
* **Dark Institutional Navy**: `#0f172a` / `#1e293b` (Headers, title text, public display dark surface)
* **Terna Accent Orange**: `#f97316` / `#ea580c` (Accent element sampled directly from the "terna" emblem circle)
* **Secondary Slate Background**: `#f8fafc` / `#f1f5f9` (Neutral canvas for crisp contrast)
* **Border Lines**: `#e2e8f0` / `#cbd5e1` (Clean 1px defined dividers and card outlines)
* **Status Badges**:
  * **Waiting / Amber**: Background `#fef3c7`, Text `#92400e`, Border `#fde68a`
  * **In Service / Serving**: Background `#dbeafe`, Text `#1e40af`, Border `#bfdbfe`
  * **Called / Success**: Background `#dcfce7`, Text `#166534`, Border `#bbf7d0`
  * **Completed**: Background `#f1f5f9`, Text `#475569`, Border `#e2e8f0`
  * **Skipped / Danger**: Background `#fee2e2`, Text `#991b1b`, Border `#fecaca`

---

## 2. Typography & Hierarchy

* **Font Family**: Inter (via Next.js `next/font/google`)
* **Weighting**:
  * Titles: SemiBold / Bold (`font-semibold`, `font-bold`, `font-extrabold`)
  * Data values: Tabular mono / clean numeric fonts
  * Labels: Compact uppercase tracking (`text-xs font-semibold uppercase tracking-wider text-slate-500`)
* **Zero Comic / Playful styling**: Strict institutional, authoritative tone.

---

## 3. Layout Structure & Geometry

* **Corner Radius**: Moderate 6px to 8px (`rounded-lg`, `rounded-xl`). Absolutely no hyper-rounded pill blobbiness.
* **Borders**: Sharp 1px solid dividers (`border border-slate-200`).
* **Shadows**: Subtle, crisp card shadows (`shadow-sm` or flat bordered cards), zero heavy colored glowing drop-shadows.
* **Information Density**: Compact cards, clear column alignments, clear statistics rows (`Total Served`, `Waiting`, `Avg Wait Time`).
* **Header Bar**: Top bar featuring `public/logo.png`, college name, and active counter summary.

---

## 4. Key Component Layouts (As extracted from Reference Diagram)

1. **Student Service Catalogue**:
   * Compact service cards displaying Prefix, Title, Estimated Duration, Waiting Count, and clear "Select / Apply" action.
2. **Apply Stepper**:
   * 4-step linear indicator: (1) Details -> (2) Form -> (3) Upload -> (4) Review & Preview.
   * Split view or embedded live A4 PDF preview before token commitment.
3. **Token Status Screen**:
   * Prominent token code display (e.g. `B-024`), assigned counter, position in line, estimated wait time, live queue mini-table.
4. **Staff Dashboard**:
   * Counter selector dropdown, "Now Serving" block, Quick Actions (Call Next, Complete, Skip, Pause), and Live Waiting Queue table with status badges.
5. **Public Display Screen**:
   * Dark theme (`#090d16` / `#0f172a`), oversized Now Serving token numbers legible from 10 meters, Next tokens column, and ticker for announcements.
