import { useState } from 'react'
import IntegrationToggleRow from '../components/IntegrationToggleRow.jsx'
import NotificationPrefToggle from '../components/NotificationPrefToggle.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

export default function ProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="p-8 flex flex-col gap-8 max-w-[700px]">
      <div>
        <h1 className="font-display text-2xl font-semibold text-on-surface">Profile &amp; settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your personal info, integrations, and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="glass-card rounded-xl p-6 flex flex-col gap-4">
        <h2 className="font-display font-semibold text-on-surface">Personal info</h2>
        <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg bg-[#0a0a0a] border border-[#262626] px-3 py-2.5 text-on-surface focus:border-secondary outline-none transition"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-on-surface-variant">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg bg-[#0a0a0a] border border-[#262626] px-3 py-2.5 text-on-surface focus:border-secondary outline-none transition"
          />
        </label>
        <button type="submit" className="self-start rounded-lg bg-white text-[#0a0a0a] text-sm font-semibold px-4 py-2 hover:opacity-90 transition">
          {saved ? 'Saved' : 'Save changes'}
        </button>
      </form>

      <div className="glass-card rounded-xl p-6">
        <h2 className="font-display font-semibold text-on-surface mb-2">Integrations</h2>
        <IntegrationToggleRow icon="code" label="GitHub" initiallyConnected />
        <IntegrationToggleRow icon="palette" label="Behance" />
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="font-display font-semibold text-on-surface mb-2">Notifications</h2>
        <NotificationPrefToggle label="Weekly analytics summary" />
        <NotificationPrefToggle label="New job matches" />
        <NotificationPrefToggle label="Product updates" defaultChecked={false} />
      </div>
    </div>
  )
}
