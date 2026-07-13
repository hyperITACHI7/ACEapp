import { Link } from 'react-router-dom'

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-display font-semibold text-lg text-on-surface">
      <span className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-[#0a0a0a] text-sm font-bold">A</span>
      Aether
    </Link>
  )
}
