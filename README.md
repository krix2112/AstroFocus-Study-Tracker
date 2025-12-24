# AstroFocus — CosmoStudy (React + Vite)

AstroFocus is a neon-astro themed study tracker focused on persistence, accurate attendance analytics, Pomodoro focus, and a personal knowledge “Wardrobe”. Built with React + Vite + TypeScript.

## ✨ Features

- Astro-Neon UI: deep charcoal background with pink/cyan neon glow accents
- Dashboard (Mission Control)
  - North Star Goal + quick save list
  - Target/Current GPA with Distance-to-Target
  - Study Timeline (last actions)
  - Daily Heatmap (neon pink scale)
  - Weekly Distribution (donut with legend)
  - Indian Calendar with toggleable custom holidays
- Timer (AstroFocus Mode)
  - Pomodoro: Focus Burst / Recharge Orbit
  - Subject tagging, ambient soundscapes
  - Session auto-save, action log, XP (+1/min)
- Assignments (Mission Control)
  - Priority (Gravity Well): High/Medium/Low
  - Subtasks/Checklist
  - Quick Play of first linked subject resource
  - XP: +50 per completed assignment
- Attendance (Comprehensive)
  - Subjects + Weekly Timetable editor (drag-add)
  - Mark Present/Absent/Cancelled/Leave; Whole Day Leave
  - Cycle control (start/end), analytics, predictions (target 75%)
  - Conducted classes computed from timetable across cycle, excluding Cancelled/Leave/Holidays
  - XP: +10 per Present
- Wardrobe (Personal Library)
  - Per-subject notes (markdown-friendly), simple diagram canvas save/load
  - Resource linking (e.g., YouTube)
  - AI Summary (~200 words) and AI Quiz (5–10 Qs) via stub/API
  - Video watch tracking contributes to study minutes and XP
- Grade Calculator (Academic)
  - Calculate SGPA based on marks and credits
  - Subject-wise grade points display
  - Total credit points and final SGPA calculation
  - Supports custom grading system (90-100→10, 80-89→9, etc.)

## 🧠 Attendance Formula

Attendance % = (Attended Classes / Total Conducted Classes) × 100

Where Total Conducted Classes for the cycle is derived as:
Scheduled by Timetable − Cancelled − Whole Day Leave − Holidays (India + custom).

Predictions (target 75%):
- Skipable: how many future classes can be skipped without dropping below 75%
- Needed: how many classes to attend consecutively to reach 75%

## 🏗️ Tech Stack

- React 19, TypeScript, Vite 7, TailwindCSS
- Recharts (charts), react-calendar-heatmap (heatmap)
- Framer Motion (visuals)
- LocalStorage persistence

## 🔧 Local Development

1) Install
```
npm ci
```
2) Run dev
```
npm run dev
```
Visit http://localhost:5173

3) Type-check/build preview
```
npm run build
npm run preview
```
Visit http://localhost:4173

## 🚀 Deploy to Vercel (Recommended)

1) Push to GitHub (or GitLab/Bitbucket)
2) In Vercel → New Project → Import repo
3) Settings:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables (optional AI):
  - `VITE_AI_ENDPOINT` (e.g., https://api.example.com)
  - `VITE_AI_API_KEY`
4) Deploy. For SPA deep links, Vercel handles rewrites automatically; if needed, add `vercel.json`:
```
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

## 🔒 Environment Variables (optional)

- Supabase (if enabling auth):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- AI (optional): `VITE_AI_ENDPOINT`, `VITE_AI_API_KEY`

## 💾 Persistence

All core data (subjects, timetable, attendance records, cycle, study sessions, action log, wardrobe notes/canvas/resources, XP/Levels) is persisted to LocalStorage with hydration guards to prevent accidental overwrites.

## 🏅 XP & Levels

- +1 XP per study minute (timer/video)
- +50 XP per assignment completed
- +10 XP per class Present
- Level thresholds: `[0, 500, 1200, 2500, 4500, 7000]`

## 📦 Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — serve production build locally

## 📸 Screenshots (placeholders)

- Dashboard — neon mission control
- Timer — orbital animation
- Attendance — stats + predictions
- Wardrobe — notes + AI quiz

## ⚖️ License

MIT — feel free to use, modify, and share.
