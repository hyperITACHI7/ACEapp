import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { usePortfolio } from '../portfolio/PortfolioContext.jsx'

export default function PreviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { portfolio, load, publish } = usePortfolio()
  const [device, setDevice] = useState('desktop')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    load(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!portfolio) return null

  const shareUrl = `aether.app/p/${portfolio.id}`

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${shareUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handlePublish = () => {
    publish()
    navigate('/dashboard')
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between border-b border-[#262626] px-6 py-3 shrink-0">
        <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 text-sm">
          <Icon name="arrow_back" />
          Back to editor
        </button>

        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Icon name="link" />
          {shareUrl}
          <button onClick={handleCopy} className="text-secondary hover:underline ml-1">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-[#262626] overflow-hidden">
            {['desktop', 'mobile'].map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  device === d ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant'
                }`}
              >
                <Icon name={d === 'desktop' ? 'desktop_windows' : 'phone_iphone'} />
              </button>
            ))}
          </div>
          <button
            onClick={handlePublish}
            className="rounded-lg bg-white text-[#0a0a0a] text-sm font-semibold px-4 py-2 hover:opacity-90 transition"
          >
            Publish
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto flex justify-center bg-[#0a0a0a] py-10">
        <div className={`flex flex-col gap-6 ${device === 'mobile' ? 'w-[375px]' : 'w-full max-w-3xl'} px-6`}>
          {portfolio.sections.map((section) => (
            <div key={section.id} className="rounded-xl border border-[#262626] p-8">
              <span className="text-xs uppercase tracking-widest text-on-surface-variant">{section.type}</span>
              <p className="mt-2 text-on-surface font-display text-2xl">
                {section.content?.headline || section.content?.title || `${section.type} section`}
              </p>
              {section.content?.tagline && <p className="text-on-surface-variant mt-2">{section.content.tagline}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
