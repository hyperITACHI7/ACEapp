import { Navigate, Outlet } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import ShaderBackground from '../components/ShaderBackground.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

export default function OnboardingLayout() {
  const { user, ready } = useAuth()

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.hasOnboarded) return <Navigate to="/dashboard" replace />

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-on-surface overflow-hidden">
      <ShaderBackground preset="aurora" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="px-6 py-6">
          <Logo />
        </header>
        <main className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
