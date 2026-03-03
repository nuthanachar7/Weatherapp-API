import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

const navItems = [
  { path: '/', label: 'Current' },
  { path: '/forecast', label: 'Forecast' },
  { path: '/historical', label: 'Historical' },
  { path: '/marine', label: 'Marine' },
  { path: '/location', label: 'Location' },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="layout">
      <header className="layout-header glass">
        <div className="layout-brand">
          <span className="layout-logo" aria-hidden>◇</span>
          <h1 className="layout-title">WeatherStack</h1>
        </div>
        <nav className="layout-nav" aria-label="Main">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`layout-nav-link ${location.pathname === path ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="layout-main">
        {children}
      </main>
    </div>
  )
}
