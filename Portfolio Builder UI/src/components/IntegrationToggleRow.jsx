import { useState } from 'react'
import Icon from './Icon.jsx'

export default function IntegrationToggleRow({ icon, label, initiallyConnected = false }) {
  const [connected, setConnected] = useState(initiallyConnected)

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#262626] last:border-0">
      <div className="flex items-center gap-3">
        <Icon name={icon} className="text-on-surface-variant" />
        <span className="text-sm text-on-surface">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${connected ? 'bg-[#262626] text-on-surface-variant' : 'bg-[#262626] text-[#a3a3a3]'}`}>
          {connected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
          {connected ? 'Connected' : 'Not connected'}
        </span>
        <button
          onClick={() => setConnected((c) => !c)}
          className="text-sm font-medium text-on-surface hover:underline"
        >
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  )
}
