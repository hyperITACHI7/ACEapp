import { Link, Outlet, useLocation } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

export default function PublicLayout() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-on-surface flex flex-col">
      <header className="border-b border-[#262626] sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          {!isAuthPage && (
            <nav className="hidden md:flex items-center gap-8 text-sm text-on-surface-variant">
              <a href="#features" className="hover:text-on-surface transition">Features</a>
              <a href="#templates" className="hover:text-on-surface transition">Templates</a>
              <a href="#pricing" className="hover:text-on-surface transition">Pricing</a>
            </nav>
          )}
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition px-3 py-2">
              Log In
            </Link>
            <Link to="/signup" className="text-sm font-semibold rounded-full bg-white text-[#0a0a0a] px-4 py-2 hover:opacity-90 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#262626]">
        <div className="max-w-[1200px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-on-surface-variant max-w-xs">
              A blank, premium canvas for creators and developers to build a portfolio worth bookmarking.
            </p>
          </div>
          <div className="text-sm text-on-surface-variant flex flex-col gap-2">
            <span className="text-on-surface font-semibold mb-1">Product</span>
            <a href="#features" className="hover:text-on-surface transition">Features</a>
            <a href="#templates" className="hover:text-on-surface transition">Templates</a>
          </div>
          <div className="text-sm text-on-surface-variant flex flex-col gap-2">
            <span className="text-on-surface font-semibold mb-1">Company</span>
            <Link to="/login" className="hover:text-on-surface transition">Log In</Link>
            <Link to="/signup" className="hover:text-on-surface transition">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
