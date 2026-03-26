# Accreditor

A multi-user concert photography accreditation tracker built for **Antihero Magazine**. Manage the full lifecycle of photo pit requests — from initial outreach to post-shoot gallery delivery — across a shared team of photographers.

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?style=flat-square&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)

---

## Overview

Accreditor replaces the scattered mix of email threads, spreadsheets, and memory that most concert photographers use to track accreditation. It gives the full Antihero team a shared CRM-style pipeline — one place to log shows, manage PR contacts, track request status, store pit restrictions, and link delivered galleries.

---

## Features

- **Accreditation pipeline** — Kanban-style board with drag-and-drop status updates across 9 stages: Upcoming → Drafted → Submitted → Awaiting Response → Granted / Rejected / Waitlisted → Shot / No Show
- **Show management** — Full CRUD for shows with artist, venue, city, date, promoter, and tour name. Upcoming and past shows split automatically
- **Per-show request tracking** — Each show has its own accreditation requests, with PR contact linking, deadline tracking, pit restriction notes, and gallery URL storage
- **PR contact book** — Shared org-wide contact directory with name, email, phone, company, and notes. Searchable across all fields
- **Request templates** — Save and reuse email pitch templates with `{{token}}` interpolation for artist, venue, city, show date, and publication
- **Deadline tracking** — Submission deadlines with urgency indicators (amber at 3 days, red at 0) surfaced on both the pipeline and dashboard
- **Dashboard** — Approval rate stats, 6-month activity chart, status breakdown, upcoming deadlines, recent activity, and top PR contacts by approval rate
- **Multi-user / org-scoped** — All data is scoped to an organisation via Supabase Row Level Security. Multiple photographers share the same shows, contacts, and templates
- **Magic link auth** — Passwordless login via Supabase Auth OTP

---

## Tech Stack

| Layer        | Technology                       |
| ------------ | -------------------------------- |
| Framework    | React 18 + TypeScript + Vite     |
| Styling      | Tailwind CSS v4                  |
| Routing      | React Router v6                  |
| Server state | TanStack React Query v5          |
| Forms        | React Hook Form + Zod            |
| Backend / DB | Supabase (Postgres + Auth + RLS) |
| Icons        | Lucide React                     |
| Utilities    | clsx + tailwind-merge            |

---

## Project Structure

```
src/
├── components/
│   ├── layout/         # AppShell, Sidebar
│   └── ui/             # Badge, Modal
├── features/
│   ├── auth/           # AuthContext, AuthProvider, AuthGuard, LoginPage, useAuth
│   ├── dashboard/      # DashboardPage
│   ├── shows/          # ShowsPage, ShowDetailPage, ShowForm, RequestForm
│   ├── contacts/       # ContactsPage, ContactForm
│   └── templates/      # TemplatesPage, TemplateForm
├── hooks/              # useShows, useRequests, useContacts, useTemplates, useDashboardStats
├── lib/                # supabase.ts, queryClient.ts, utils.ts, constants.ts
└── types/              # database.ts
```

---

## Database Schema

Six tables, all protected by Row Level Security scoped to `organization_id`:

- `organizations` — tenant/org record
- `profiles` — extends `auth.users` with org membership and role
- `shows` — concert/event records
- `pr_contacts` — shared PR contact book
- `request_templates` — reusable pitch templates
- `accreditation_requests` — the core entity linking shows, contacts, photographers, and status

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the schema applied (see below)

### Installation

```bash
git clone https://github.com/yourusername/accreditor.git
cd accreditor
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database setup

Run the SQL files in order in your Supabase SQL editor:

1. Organizations + profiles + trigger
2. PR contacts
3. Shows
4. Request templates
5. Accreditation requests
6. RLS policies
7. Indexes + updated_at triggers
8. Seed your organization row

```sql
insert into organizations (id, name, slug)
values (gen_random_uuid(), 'Your Publication', 'your-publication');
```

### Run locally

```bash
npm run dev
```

---

## Deployment

```bash
npm run build
```

The `dist/` folder is production-ready. Deploy to Vercel, Netlify, or any static host. Set the environment variables in your hosting provider's dashboard.

---

## Roadmap

- [ ] `dnd-kit` for smoother pipeline drag-and-drop
- [ ] Email compose flow — open mailto with interpolated template pre-filled
- [ ] Deadline notifications via Supabase Edge Functions + Resend
- [ ] Approval rate analytics per venue and genre
- [ ] Mobile-optimised pipeline view
