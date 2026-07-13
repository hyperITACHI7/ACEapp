import { useState } from 'react'

export default function JobCard({ job }) {
  const [applied, setApplied] = useState(false)

  return (
    <div className="glass-card rounded-xl p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-display font-semibold text-on-surface">{job.title}</h3>
          <p className="text-sm text-on-surface-variant">{job.company} · {job.location}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-tertiary bg-tertiary-container/20 px-2 py-1 rounded-full">
          {job.matchScore}% match
        </span>
      </div>
      <p className="text-sm text-on-surface-variant">{job.description}</p>
      <div className="flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[#262626] text-[#a3a3a3]">
            {tag}
          </span>
        ))}
      </div>
      {applied ? (
        <span className="mt-2 w-full text-center rounded-lg border border-tertiary text-tertiary font-semibold py-2 text-sm">
          Applied
        </span>
      ) : (
        <button
          onClick={() => setApplied(true)}
          className="mt-2 w-full rounded-lg bg-white text-[#0a0a0a] font-semibold py-2 text-sm hover:opacity-90 transition"
        >
          Apply with portfolio
        </button>
      )}
    </div>
  )
}
