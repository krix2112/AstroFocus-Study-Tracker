import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Timer from './pages/Timer'
import Assignments from './pages/Assignments'
import Attendance from './pages/Attendance'
import Wardrobe from './pages/Wardrobe'
import GradeCalculator from './pages/GradeCalculator'
// auth removed for MVP

export default function App() {

  return (
    <div className="flex min-h-screen relative flex-col">
      <div className="nebula-bg" />
      <div className="flex flex-1">
        <aside className="w-56 bg-black/40 p-4 border-r border-white/5">
          <h1 className="text-2xl font-bold gradient-text heading-neon mb-4">CosmoStudy</h1>
          <nav className="flex flex-col gap-2">
            <Link to="/" className="btn-neon px-2 py-1 rounded">Dashboard</Link>
            <Link to="/timer" className="btn-neon px-2 py-1 rounded">Timer</Link>
            <Link to="/assignments" className="btn-neon px-2 py-1 rounded">Assignments</Link>
            <Link to="/attendance" className="btn-neon px-2 py-1 rounded">Attendance</Link>
            <Link to="/grade-calculator" className="btn-neon px-2 py-1 rounded">Grade Calculator</Link>
            <Link to="/wardrobe" className="btn-neon px-2 py-1 rounded">Wardrobe</Link>
          </nav>
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
    </div>
  )
}
