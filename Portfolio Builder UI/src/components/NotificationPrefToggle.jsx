import { useState } from 'react'

export default function NotificationPrefToggle({ label, defaultChecked = true }) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <label className="flex items-center justify-between py-3 border-b border-[#262626] last:border-0 cursor-pointer">
      <span className="text-sm text-on-surface">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((c) => !c)}
        className={`relative w-11 h-6 shrink-0 rounded-full border transition-colors ${
          checked ? 'bg-white border-white' : 'bg-[#262626] border-[#444748]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform ${
            checked ? 'bg-[#0a0a0a] translate-x-5' : 'bg-[#a3a3a3] translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}
