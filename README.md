# Industry Evidence Hub

A production-quality web application built to help technical colleges, workforce programs, instructional designers, and industry partners capture authentic occupational evidence from the workplace and link it to curriculum adjustments (courses, competencies, and mastery assessments).

The application strictly separates **Raw Source Evidence** (provided by industry) from **Human Interpretation & Mappings** (created by faculty/instructional designers), with **zero AI dependencies** to maintain strict human accountability and audit integrity.

---

## 🚀 Key Features

* **Authenticated Workspaces**: Switch identities (Dean, Instructional Designer, SME, Faculty) to test different permissions.
* **Workplace Evidence Inbox**: Search, filter, and review submittals side-by-side with mapping notes and tags.
* **Evidence Requests (Campaigns)**: Generate customizable campaign links and print-friendly QR Codes to solicit submissions.
* **Occupational Task Profiles**: Author and catalog clear workplace situations, tools, safety requirements, and common errors.
* **Curriculum Actions Log**: Trace institutional changes (e.g. Revised Hydraulic diagnostic labs) back to multiple supporting evidence reference codes.
* **Audit-Ready Reports**: 
  * **Coverage Matrix**: Tabular overview of competency alignment and evidence density.
  * **Freshness & Gaps**: View current vs warning vs stale records and list underserved competencies.
  * **Evidence Packet Assembler**: Generate print-friendly, comprehensive portfolios of evidence, task profiles, errors, tools, and actions by competency.
* **Immutable Audit Trail**: Security panel logging all record creations, reviews, mappings, and configuration overrides showing detailed JSON comparisons.
* **Configuration & Exports**: Manage retention settings, warning thresholds, and trigger instant CSV/JSON database backups.

---

## 🛠️ Technology Stack

* **Core**: Next.js (App Router), React, TypeScript
* **Styling**: Pure Vanilla CSS design tokens (slate dark theme, neon highlighting, glassmorphism, responsive grids)
* **Storage & Auth**: Dual-Mode Database Layer supporting:
  * **Mock Mode (Default)**: Dynamic, client-side in-memory and `localStorage` caching which persists state across refreshes.
  * **Live Mode**: Ready to connect directly to a Supabase Postgres instance.

---

## 💻 Getting Started (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run the Automated Test Suite
To execute the 14-assertion integration test suite checking multi-tenant isolation, role permission bounds, and freshness stats:
```bash
npm test
```

---

## 🤝 Enabling the Live GitHub Pages Preview

This project is configured with a GitHub Actions workflow that automatically builds and deploys the app as a static preview site for easy testing.

1. Go to your repository settings page: `https://github.com/kaganlove/industry-evidence-hub/settings`.
2. Select the **Pages** tab in the left sidebar.
3. Under **Build and deployment -> Source**, change the dropdown from *"Deploy from a branch"* to **GitHub Actions**.
4. Push any change to the `main` branch (or run the workflow manually in the **Actions** tab). Your live preview link will be live at:
   **[https://kaganlove.github.io/industry-evidence-hub/](https://kaganlove.github.io/industry-evidence-hub/)**

---

## 🗄️ Connecting to Supabase Production Database

To transition the application from client-side mock simulation to a live Postgres storage backend:

1. Create a project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase dashboard.
3. Copy the schema migration script from `supabase/migrations/20260807000000_schema.sql`, paste it, and click **Run** to build the database tables.
4. In the Supabase **Storage** tab, create a new **Private Bucket** named `submissions`.
5. Create a file named `.env.local` in the root folder of this project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-reference-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-project-anon-key-string
   ```
6. Restart your server. The application will automatically detect these keys and connect to your live database!
