import { useNavigate } from 'react-router-dom'
import TemplateCard from '../components/TemplateCard.jsx'
import { templates } from '../data/templates.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function TemplateRecommendationsPage() {
  const navigate = useNavigate()
  const { completeOnboarding } = useAuth()

  const handleUseTemplate = () => {
    completeOnboarding()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold text-on-surface">Recommended for you</h1>
        <p className="text-on-surface-variant">Based on your answers, these themes are the best fit.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" onClick={handleUseTemplate}>
        {templates.slice(0, 3).map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>

      <button
        onClick={() => {
          completeOnboarding()
          navigate('/dashboard')
        }}
        className="self-center text-sm text-on-surface-variant hover:text-on-surface transition"
      >
        Skip, I&apos;ll choose later
      </button>
    </div>
  )
}
