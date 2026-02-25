<div align="center">

# 🚀 AstroFocus Study Tracker

**A neon-astro themed academic companion for university students**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://astro-focus-study-tracker-9d6f.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Track your academics across the cosmos — attendance, focus, grades, and beyond.*

</div>

---

## ✨ Features

### 🎯 Mission Control Dashboard
- North Star goal setting and progress tracking
- SGPA / GPA tracking with Distance-to-Target analytics
- Daily activity heatmap with neon pink visualization

### ⏱️ AstroFocus Timer
- Pomodoro with **Focus Burst** and **Recharge Orbit** modes
- Subject tagging and ambient soundscapes
- XP gain (+1 XP per study minute)

### 📊 Smart Attendance Tracker
- Drag-and-drop timetable editor
- Predictive analytics — how many classes you can skip or still need to attend
- Automated calculations that exclude holidays
- 75% attendance threshold tracking

### 🧠 Knowledge Wardrobe
- Per-subject Markdown notes
- Diagram canvas
- AI-generated summaries and quizzes
- Video tracking with XP rewards

### 📝 Mission Assignments
- Priority Gravity Wells: High / Medium / Low
- Subtask checklists and resource linking
- +50 XP on completion

### 🎓 Grade Calculator
- SGPA computation with custom grading scales (10-point system)
- Real-time grade point and credit tracking

### 🎮 Gamification System

| Action | XP Reward |
|---|---|
| 1 minute of study | +1 XP |
| Class attended | +10 XP |
| Assignment completed | +50 XP |
| Level up bonus | +100 XP |

### 🔐 Student Identity Verification *(JSS University)*
Students log in with their Roll Number and Mobile Number, validated against JSS University's database. Mobile numbers are hashed (SHA-256). Once verified, all academic data is linked to the student's identity and persists across sessions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript (Strict Mode) |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS, Framer Motion |
| Charts | Recharts |
| State | React Context API + Custom Hooks |
| Persistence | LocalStorage (offline-first) |
| Deployment | Vercel |

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Dashboard/       # Mission Control
│   ├── Timer/           # AstroFocus Mode
│   ├── Attendance/      # Analytics engine
│   └── Wardrobe/        # Knowledge library
├── hooks/
│   ├── useLocalStorage  # Persistence layer
│   ├── useAttendance    # Calculation engine
│   └── useTimer         # Pomodoro logic
├── context/
│   ├── AuthContext      # Student verification
│   └── ThemeContext     # Neon aesthetic
└── services/
    ├── verificationService.ts  # JSS University API
    └── aiService.ts            # OpenAI integration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/krix2112/AstroFocus-Study-Tracker.git

# Navigate into the project
cd AstroFocus-Study-Tracker

# Install dependencies
npm install

# Start the dev server
npm run dev
# → http://localhost:5173
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_UNIVERSITY_API_URL=https://api.jssuniversity.edu
VITE_AI_ENDPOINT=your_openai_endpoint
VITE_AI_API_KEY=your_api_key
```

### Deploy to Vercel

```bash
npm run build
```

| Setting | Value |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Framework Preset | Vite |

---

## 🎨 Design Philosophy

AstroFocus uses a **LocalStorage-first architecture** — built for university students who deal with unreliable internet connections. All data persists locally with hydration guards to prevent accidental overwrites. Once verified, the app functions fully offline and syncs when a connection is available.

The visual identity draws from cosmic and cyberpunk aesthetics: neon pink and cyan glows, animated star fields, and space-themed terminology that turns mundane academic tasks into an interstellar journey.

---

## 📄 Additional Docs

- [`DATABASE_SETUP.md`](DATABASE_SETUP.md) — Database schema and setup
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — Deployment guide
- [`SETUP_INSTRUCTIONS.md`](SETUP_INSTRUCTIONS.md) — Full setup walkthrough
- [`IMPORT_STUDENTS.md`](IMPORT_STUDENTS.md) — Bulk student import guide

---

## 📝 License

MIT © 2024 AstroFocus. Built with 💜 for JSS University Students.
