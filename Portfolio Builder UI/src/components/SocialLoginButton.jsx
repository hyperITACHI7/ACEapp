import Icon from './Icon.jsx'

const ICONS = {
  google: 'g_translate',
  linkedin: 'work',
}

export default function SocialLoginButton({ provider, label }) {
  return (
    <button
      type="button"
      onClick={(e) => e.preventDefault()}
      className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] text-on-surface text-sm font-medium py-2.5 hover:border-secondary transition"
    >
      <Icon name={ICONS[provider] || 'public'} />
      {label}
    </button>
  )
}
