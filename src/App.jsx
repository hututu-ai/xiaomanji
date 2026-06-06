import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Cover from './pages/Cover.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Home from './pages/Home.jsx'
import Capture from './pages/Capture.jsx'
import Shiji from './pages/Shiji.jsx'
import Calendar from './pages/Calendar.jsx'
import NavBar from './components/NavBar.jsx'

export default function App() {
  const location = useLocation()
  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split('/')[1] || 'cover'}>
          <Route path="/" element={<Cover />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/capture/:themeId" element={<Capture />} />
          <Route path="/shiji" element={<Shiji />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </AnimatePresence>
      <NavBar />
    </div>
  )
}
