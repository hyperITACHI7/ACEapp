import { Link } from 'react-router-dom'
import ShaderBackground from '../components/ShaderBackground.jsx'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

export default function NotFoundPage() {
  const { user } = useAuth()

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-on-surface flex flex-col items-center justify-center overflow-hidden px-6">
      <ShaderBackground preset="solarFlare" />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <Logo />
        <span className="font-display text-8xl font-bold text-on-surface mt-6">404</span>
        <p className="text-on-surface-variant max-w-sm">
          This page drifted off canvas. Let&apos;s get you back somewhere useful.
        </p>
        <Link
          to={user ? '/dashboard' : '/'}
          className="mt-4 rounded-full bg-white text-[#0a0a0a] font-semibold px-6 py-3 hover:opacity-90 transition"
        >
          {user ? 'Back to dashboard' : 'Back home'}
        </Link>
      </div>
    </div>
  )
}
