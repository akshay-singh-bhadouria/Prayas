# PRAYAS – Offline-First, GenAI-Powered UPSC Preparation Companion

PRAYAS is a hackathon-grade, production-ready UPSC preparation platform built with Next.js 14 (App Router). It runs entirely without authentication or a database, stores data locally in the browser, works offline via PWA, and integrates GenAI for planning, evaluation, and mentorship.

## Features
- Offline-first PWA with service worker caching
- Smart AI preparation planner (Server Actions)
- UPSC Pulse: news + AI summaries + UPSC relevance
- Local testing & analytics (Recharts + JSON bank)
- AI answer writing evaluator
- AI mentor with modes (strategy, motivation, counselling)
- Motivation & wellness with burnout detection

## Tech Stack
- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- Shadcn/UI patterns
- Framer Motion
- Recharts
- IndexedDB + localStorage

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
Copy `.env.example` to `.env.local` and add your API keys.

### 3) Run locally
```bash
npm run dev
```

### 4) Build for production
```bash
npm run build
npm run start
```

## Offline Mode
- The PWA caches pages and assets for offline usage.
- AI features require connectivity. Plans, summaries, and sessions are cached locally for offline access.

## Deployment (Vercel)
1. Push the repo to GitHub.
2. Import into Vercel.
3. Add environment variables from `.env.example`.
4. Deploy.

## Future Scope (Not Implemented)
- Authentication & user profiles
- Peer-to-peer learning circles
- Mentor marketplace
- Long-term analytics dashboard
- Native mobile app

## Notes
- All user data stays on the device (IndexedDB + localStorage).
- The AI layer is provider-agnostic and configurable via env vars.
