# KenWork AI

An AI-powered workplace productivity assistant built with React, Tailwind CSS, and Lovable AI. It helps professionals draft emails, summarize meeting notes, and plan their workday — all with a vibrant, colorful interface.

---

## Project Overview

KenWork AI is a workplace productivity tool designed to solve real-world digital workflow challenges using modern AI. It features three core productivity modules wrapped in a clean, rainbow-themed UI with full authentication and a persistent generation history.

**Design Style:** Corporate Clean with a colorful rainbow twist

---

## Features

### 1. Smart Email Generator
- Choose tone (Professional, Formal, Friendly, Persuasive, Apologetic, Concise) and audience (Client, Manager, Team, Vendor, Executive, New hire)
- Enter subject hint and key bullet points
- AI drafts a polished, well-structured professional email with a subject line and polite greeting/sign-off

### 2. Meeting Notes Summarizer
- Paste raw meeting notes or a transcript
- AI produces a clean markdown summary including:
  - Summary overview
  - Key Decisions
  - Action Items with owners and deadlines
  - Deadlines mentioned
  - Open Questions

### 3. AI Task Planner
- Define planning scope (Today, Tomorrow, This week)
- Set available focus hours
- List tasks and goals
- AI returns a prioritized, time-blocked plan with:
  - Top Priorities
  - Time-blocked Schedule
  - Quick Wins
  - Defer / Delegate suggestions
  - Tailored productivity tip

### 4. Authentication & History
- Secure login/signup with email and password
- All generations are saved to your personal history
- Copy any generation to clipboard with one click
- Delete history items you no longer need

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start v1 (React 19 + Vite 7) |
| Styling | Tailwind CSS v4 with custom rainbow theme tokens |
| UI Components | shadcn/ui |
| Backend | Lovable Cloud (Supabase) |
| Auth | Supabase Auth with Row Level Security (RLS) |
| AI | Lovable AI Gateway (Google Gemini 3 Flash) |
| State Management | TanStack Query + React Server Functions |

---

## Project Structure

```
├── src/
│   ├── components/ui/          # shadcn/ui components (Button, Card, Input, Tabs, etc.)
│   ├── integrations/
│   │   ├── lovable/            # AI Gateway provider
│   │   └── supabase/           # Supabase client, auth middleware, types
│   ├── lib/
│   │   ├── ai-gateway.server.ts    # AI provider setup
│   │   └── generations.functions.ts # Server functions: generate, list, delete
│   ├── routes/
│   │   ├── __root.tsx          # Root layout
│   │   ├── index.tsx           # Landing page
│   │   ├── auth.tsx            # Login / Sign-up page
│   │   ├── _authenticated/     # Protected routes
│   │   │   ├── route.tsx       # Auth layout guard
│   │   │   └── app.tsx         # Dashboard with tools + history
│   ├── router.tsx              # TanStack Router config
│   ├── server.ts               # Server entry
│   ├── start.ts                # TanStack Start instance
│   └── styles.css              # Tailwind tokens + rainbow gradients
├── supabase/
│   ├── migrations/             # Database schema + RLS policies
│   └── config.toml
├── package.json
├── vite.config.ts
└── README.md
```

---

## Setup & Development

### Prerequisites
- Node.js 20+ and Bun (or npm)
- A Lovable Cloud project with Supabase enabled

### Environment Variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
LOVABLE_API_KEY=<your-lovable-ai-gateway-key>
```

### Install & Run
```bash
bun install
bun dev
```

The app will be available at `http://localhost:3000`.

### Database
Run the included migration to set up the `generations` table with RLS policies:
```bash
supabase migration up
```

---

## Key Design Decisions

- **Rainbow Theme:** All primary accents use an animated CSS gradient (red → orange → yellow → green → blue → purple) for a lively, memorable brand identity.
- **Server Functions:** All AI generation, CRUD, and auth operations run through type-safe `createServerFn` RPCs, keeping the frontend lightweight and secure.
- **RLS:** Every database row is scoped to the authenticated user via Supabase Row Level Security — no user can access another's data.
- **Persistent History:** Every AI generation is saved automatically so users can reference, copy, or delete past outputs.

---

## Future Enhancements

- Export history to PDF or markdown
- Team/shared workspace mode
- Scheduled email send integration
- Calendar sync for the AI Task Planner
- Voice input for meeting notes

---

## License

MIT — built for educational and productivity purposes.