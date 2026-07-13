import { useMemo, useState } from 'react'
import TemplateCard from '../components/TemplateCard.jsx'
import { templates } from '../data/templates.js'

const CATEGORIES = ['all', 'developer', 'photographer', 'architect', 'writer', 'motion', 'generalist']

export default function ExplorePage() {
  const [category, setCategory] = useState('all')

  const filtered = useMemo(
    () => (category === 'all' ? templates : templates.filter((t) => t.category === category)),
    [category]
  )

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1100px]">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Explore templates</h1>
        <p className="text-sm text-on-surface-variant mt-1">Browse themes and widgets by profession or style.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-sm px-4 py-1.5 rounded-full border transition capitalize ${
              category === c
                ? 'border-primary bg-primary/10 text-on-surface'
                : 'border-[#262626] text-on-surface-variant hover:border-secondary hover:text-on-surface'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  )
}
