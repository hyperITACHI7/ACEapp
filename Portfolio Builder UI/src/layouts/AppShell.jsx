import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import Icon from '../components/Icon.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/explore', label: 'Explore', icon: 'grid_view' },
  { to: '/jobs', label: 'Jobs', icon: 'work' },
  { to: '/profile', label: 'Settings', icon: 'settings' },
]

function navLinkClass({ isActive }) {
  return `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
    isActive ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
  }`
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-on-surface flex">
      <aside className="w-64 shrink-0 border-r border-[#262626] flex flex-col justify-between p-4 sticky top-0 h-screen">
        <div className="flex flex-col gap-8">
          <Logo to="/dashboard" />
          <button
            onClick={() => navigate('/editor')}
            className="flex items-center justify-center gap-2 rounded-lg bg-white text-[#0a0a0a] font-semibold py-2.5 text-sm hover:opacity-90 transition"
          >
            <Icon name="add" />
            Create New
          </button>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#262626] pt-4">
          <NavLink to="/profile" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-container-high/60 transition">
            <span className="h-9 w-9 rounded-full bg-surface-container-high flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name || 'Creator'}</span>
              <span className="text-xs text-on-surface-variant truncate">{user?.email}</span>
            </div>
          </NavLink>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface transition"
          >
            <Icon name="logout" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
