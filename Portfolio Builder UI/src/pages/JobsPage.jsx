import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import JobCard from '../components/JobCard.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import { jobs } from '../data/jobs.js'

export default function JobsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1100px]">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Job suggestions</h1>
        <p className="text-sm text-on-surface-variant mt-1">Matched to your portfolio and goals.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {loading ? <LoadingSkeleton count={4} className="h-44" /> : jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>

      <div className="flex items-center gap-4 pt-2 text-sm">
        <Link to="/dashboard" className="text-secondary hover:underline">
          Back to dashboard
        </Link>
        <Link to="/profile" className="text-secondary hover:underline">
          Update profile
        </Link>
      </div>
    </div>
  )
}
