import { NavLink, useLocation } from 'react-router-dom'
import './NavBar.css'

const TABS = [
  { to: '/home', label: '寻物令' },
  { to: '/shiji', label: '诗笺夹' },
  { to: '/calendar', label: '集章记' },
]

export default function NavBar() {
  const { pathname } = useLocation()
  if (pathname === '/' || pathname === '/onboarding') return null // 封面/引导页不显示
  return (
    <nav className="navbar">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className="nav-item">
          <span className="nav-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
