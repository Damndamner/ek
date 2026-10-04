# IELTS + Life Quest (React + Tailwind)

Vite + React 18 + Tailwind CSS v4. Data is stored in browser localStorage (`ielts-tracker-v1`).

## Run
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # static build in dist/

## Structure
- `src/store.jsx`   app state, persistence, points/badges/navigation
- `src/timer.jsx`   study timer engine (bottom dock)
- `src/panels/`     one file per tab (Today, LifeCalendar, Words, Grammar, Writing, Speaking, ReadListen, Timers, StudyCalendar, Topics, Work, Expenses, Body, Reflect, Cycle, Rewards)
- `src/components/` Header, Nav, Dock, Pops, shared UI kit (`ui.jsx`)
- `src/lib/`        plan builder, dates, ics export, life constants
- `src/data/content.js` prompts, vocabulary, grammar quizzes
- `src/index.css`   Tailwind theme + 7 colour palettes (`data-pal` on <html>)

## Notes
- "Check with Claude" features are now **Copy prompt for Claude** buttons: paste into any Claude chat, then paste the reply back.
- Progress backup: Rewards > Save / Load (also loads old Ek's Daily Quest files).
- Google Calendar: per-event links and .ics export (no live sync).
