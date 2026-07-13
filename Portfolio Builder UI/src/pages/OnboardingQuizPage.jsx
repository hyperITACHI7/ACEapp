import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  {
    key: 'role',
    question: "What's your role?",
    options: ['Developer', 'Designer', 'Photographer', 'Writer', 'Architect'],
  },
  {
    key: 'domain',
    question: 'What domain best describes your work?',
    options: ['Product', 'Web', 'Mobile', 'Brand', 'Editorial'],
  },
  {
    key: 'goal',
    question: "What's your main goal?",
    options: ['Land a job', 'Attract clients', 'Showcase side projects', 'Build my personal brand'],
  },
]

export default function OnboardingQuizPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const current = STEPS[step]

  const choose = (value) => {
    setAnswers((prev) => ({ ...prev, [current.key]: value }))
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      navigate('/onboarding/resume')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-[#262626]'}`} />
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center gap-8">
        <span className="text-xs uppercase tracking-widest text-on-surface-variant">
          Step {step + 1} of {STEPS.length}
        </span>
        <h1 className="font-display text-3xl font-semibold text-on-surface">{current.question}</h1>
        <div className="flex flex-wrap justify-center gap-3">
          {current.options.map((opt) => (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                answers[current.key] === opt
                  ? 'border-primary bg-primary/10 text-on-surface'
                  : 'border-[#262626] text-on-surface-variant hover:border-secondary hover:text-on-surface'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
