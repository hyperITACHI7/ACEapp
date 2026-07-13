import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import PortfolioHealthScore from '../components/PortfolioHealthScore.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import { portfolios as seedPortfolios, growth, healthScore } from '../data/dashboardStats.js'
import { listPortfolios } from '../portfolio/PortfolioContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [portfolios, setPortfolios] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = listPortfolios()
      setPortfolios(saved.length ? saved : seedPortfolios)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[1100px]">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Welcome back, {user?.name || 'Creator'}</h1>
        <p className="text-sm text-on-surface-variant mt-1">Here&apos;s how your portfolios are doing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 flex flex-col gap-1">
          <span className="text-xs text-on-surface-variant">Views (30d)</span>
          <span className="font-display text-2xl font-semibold">{growth.views.toLocaleString()}</span>
          <span className="text-xs text-tertiary">+{growth.viewsDelta}%</span>
        </div>
        <div className="glass-card rounded-xl p-6 flex flex-col gap-1">
          <span className="text-xs text-on-surface-variant">Visitors (30d)</span>
          <span className="font-display text-2xl font-semibold">{growth.visitors.toLocaleString()}</span>
          <span className="text-xs text-tertiary">+{growth.visitorsDelta}%</span>
        </div>
        <div className="glass-card rounded-xl p-6 flex items-center gap-4">
          <PortfolioHealthScore value={healthScore.value} size={64} />
          <div>
            <span className="text-xs text-on-surface-variant block">Portfolio health</span>
            <span className="text-sm text-on-surface">{healthScore.tips.length} tips to improve</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="font-display font-semibold text-on-surface mb-4">Boost your score</h2>
        <div className="flex flex-col gap-3">
          {healthScore.tips.map((tip) => (
            <div key={tip.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Icon name={tip.icon} className="text-secondary" />
                {tip.label}
              </div>
              <span className="text-tertiary font-medium">{tip.benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-on-surface">Your portfolios</h2>
          <button
            onClick={() => navigate('/editor')}
            className="text-sm font-semibold text-secondary hover:underline"
          >
            + New portfolio
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
            <LoadingSkeleton count={2} />
          ) : (
            portfolios.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/editor/${p.id}`)}
                className="glass-card rounded-xl p-5 text-left flex flex-col gap-2 hover:border-secondary border border-transparent transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-on-surface">{p.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === 'published' ? 'bg-tertiary-container/20 text-tertiary' : 'bg-[#262626] text-[#a3a3a3]'
                    }`}
                  >
                    {p.status === 'published' ? 'Live' : 'Draft'}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant">Edited {p.lastEdited}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
