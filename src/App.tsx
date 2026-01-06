import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Timer from './pages/Timer'
import Assignments from './pages/Assignments'
import Attendance from './pages/Attendance'
import Wardrobe from './pages/Wardrobe'
import GradeCalculator from './pages/GradeCalculator'
import Login from './pages/Login'

export default function App() {
  const auth = useAuth();
  const user = auth?.user || null;
  const loading = auth?.loading ?? true;
  const signOut = auth?.signOut || (async () => {});

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show login
  if (!user) {
    return (
      <div className="flex min-h-screen relative flex-col">
        <div className="nebula-bg" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Analytics />
      </div>
    );
  }

  // If authenticated, show main app
  return (
    <div className="flex min-h-screen relative flex-col">
      <div className="nebula-bg" />
      <div className="flex flex-1">
        <aside className="w-56 bg-black/40 p-4 border-r border-white/5">
          <h1 className="text-2xl font-bold gradient-text heading-neon mb-4">CosmoStudy</h1>
          <div className="mb-4 p-2 bg-white/5 rounded text-sm">
            <p className="text-slate-300">Roll No:</p>
            <p className="text-neonCyan font-semibold">{user.roll_no}</p>
          </div>
          <nav className="flex flex-col gap-2">
            <Link to="/" className="btn-neon px-2 py-1 rounded">Dashboard</Link>
            <Link to="/timer" className="btn-neon px-2 py-1 rounded">Timer</Link>
            <Link to="/assignments" className="btn-neon px-2 py-1 rounded">Assignments</Link>
            <Link to="/attendance" className="btn-neon px-2 py-1 rounded">Attendance</Link>
            <Link to="/grade-calculator" className="btn-neon px-2 py-1 rounded">Grade Calculator</Link>
            <Link to="/wardrobe" className="btn-neon px-2 py-1 rounded">Wardrobe</Link>
          </nav>
          <button
            onClick={signOut}
            className="mt-4 w-full px-2 py-1 rounded bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 transition border border-pink-500/30"
          >
            Sign Out
          </button>
        </aside>
        <main className="flex-1 p-6 flex flex-col">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/grade-calculator" element={<GradeCalculator />} />
              <Route path="/wardrobe" element={<Wardrobe />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <footer className="mt-auto pt-6 pb-4 text-center border-t border-white/10">
            <p className="text-slate-400 text-sm">
              Built by Krishna ❤️
            </p>
          </footer>
        </main>
      </div>
      <Analytics />
    </div>
  )
}
