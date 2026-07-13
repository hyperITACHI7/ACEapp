const PRESETS = {
  aurora: ['rgba(200,198,201,0.5)', 'rgba(120,120,122,0.4)', 'rgba(80,80,82,0.3)'],
  deepSea: ['rgba(160,160,162,0.4)', 'rgba(100,100,102,0.35)', 'rgba(60,60,62,0.3)'],
  neonPulse: ['rgba(210,208,211,0.45)', 'rgba(130,130,132,0.35)', 'rgba(70,70,72,0.3)'],
  solarFlare: ['rgba(180,180,182,0.4)', 'rgba(110,110,112,0.35)', 'rgba(90,90,92,0.3)'],
}

export default function ShaderBackground({ preset = 'aurora', className = '' }) {
  const [c1, c2, c3] = PRESETS[preset] || PRESETS.aurora
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="absolute -top-1/4 -left-1/4 h-[70%] w-[70%] rounded-full opacity-40 blur-[120px] animate-pulse"
        style={{ background: c1, animationDuration: '8s' }}
      />
      <div
        className="absolute top-1/3 -right-1/4 h-[60%] w-[60%] rounded-full opacity-30 blur-[120px] animate-pulse"
        style={{ background: c2, animationDuration: '10s' }}
      />
      <div
        className="absolute -bottom-1/4 left-1/4 h-[55%] w-[55%] rounded-full opacity-30 blur-[120px] animate-pulse"
        style={{ background: c3, animationDuration: '12s' }}
      />
    </div>
  )
}
