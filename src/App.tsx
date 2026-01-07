import { Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { useAuth } from './context/AuthContext'
import Navigation from './components/Navigation'
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

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-secondary animate-pulse-slow">Loading ONE STOP...</div>
      </div>
    );
  }

  // If not authenticated, show login
  if (!user) {
    return (
      <div className="flex min-h-screen relative flex-col bg-bg-primary">
        <div className="onestop-bg" />
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
    <div className="flex min-h-screen relative flex-col bg-bg-primary">
      <div className="onestop-bg" />
      <div className="flex flex-1 relative z-10">
        <Navigation />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/grade-calculator" element={<GradeCalculator />} />
              <Route path="/wardrobe" element={<Wardrobe />} />
              <Route path="/cgpa-tracker" element={<GradeCalculator />} />
              <Route path="/resources" element={<div className="glass-card p-8"><h2 className="text-2xl font-bold mb-4">Resources</h2><p className="text-text-secondary">Coming soon...</p></div>} />
              <Route path="/ai-assistant" element={<div className="glass-card p-8"><h2 className="text-2xl font-bold mb-4">AI Assistant</h2><p className="text-text-secondary">Coming soon...</p></div>} />
              <Route path="/settings" element={<div className="glass-card p-8"><h2 className="text-2xl font-bold mb-4">Settings</h2><p className="text-text-secondary">Coming soon...</p></div>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <footer className="mt-auto pt-6 pb-4 text-center border-t border-border max-w-7xl mx-auto w-full px-6">
            <p className="text-text-tertiary text-sm">
              ONE STOP — Built with precision ❤️
            </p>
          </footer>
        </main>
      </div>
      <Analytics />
    </div>
  )
}
