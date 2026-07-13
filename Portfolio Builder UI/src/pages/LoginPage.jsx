import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ShaderBackground from '../components/ShaderBackground.jsx'
import SocialLoginButton from '../components/SocialLoginButton.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) return
    login(email)
    const redirectTo = location.state?.from?.pathname || '/dashboard'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-16 overflow-hidden">
      <ShaderBackground preset="deepSea" />
      <div className="relative z-10 w-full max-w-md glass-panel rounded-2xl p-8">
        <h1 className="font-display text-2xl font-semibold text-on-surface mb-1">Welcome back</h1>
        <p className="text-sm text-on-surface-variant mb-6">Log in to keep building your portfolio.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg bg-[#0a0a0a] border border-[#262626] px-3 py-2.5 text-on-surface focus:border-secondary outline-none transition"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg bg-[#0a0a0a] border border-[#262626] px-3 py-2.5 text-on-surface focus:border-secondary outline-none transition"
              placeholder="••••••••"
            />
          </label>
          <button type="button" className="self-end text-xs text-secondary hover:underline -mt-2">
            Forgot password?
          </button>
          <button type="submit" className="rounded-lg bg-white text-[#0a0a0a] font-semibold py-2.5 hover:opacity-90 transition">
            Log in
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-[#262626]" />
          <span className="text-xs text-on-surface-variant">or continue with</span>
          <div className="h-px flex-1 bg-[#262626]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SocialLoginButton provider="google" label="Google" />
          <SocialLoginButton provider="linkedin" label="LinkedIn" />
        </div>

        <p className="text-sm text-on-surface-variant text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-secondary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
