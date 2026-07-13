import { useNavigate } from 'react-router-dom'

export default function TemplateCard({ template }) {
  const navigate = useNavigate()

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col">
      <div
        className="h-40 w-full"
        style={{ background: 'linear-gradient(135deg, #262b2c, #0a0a0a)' }}
      />
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-display font-semibold text-on-surface">{template.name}</h3>
          <span className="shrink-0 text-xs font-semibold text-tertiary bg-tertiary-container/20 px-2 py-1 rounded-full">
            {template.matchScore}% match
          </span>
        </div>
        <p className="text-sm text-on-surface-variant flex-1">{template.tagline}</p>
        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[#262626] text-[#a3a3a3]">
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={() => navigate(`/editor?template=${template.id}`)}
          className="mt-2 w-full rounded-lg bg-white text-[#0a0a0a] font-semibold py-2 text-sm hover:opacity-90 transition"
        >
          Use this template
        </button>
      </div>
    </div>
  )
}
