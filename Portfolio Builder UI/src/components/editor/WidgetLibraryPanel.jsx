import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import Icon from '../Icon.jsx'
import ComingSoonBadge from '../ComingSoonBadge.jsx'
import { widgets } from '../../data/widgets.js'
import { templates } from '../../data/templates.js'

function WidgetCard({ widget }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `widget-${widget.type}`,
    disabled: !widget.enabled,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20, position: 'relative' }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(widget.enabled ? { ...listeners, ...attributes } : {})}
      className={`relative rounded-lg border border-[#262626] p-3 flex flex-col items-center gap-1.5 text-xs transition ${
        widget.enabled ? 'cursor-grab hover:border-secondary' : 'opacity-50 cursor-not-allowed'
      }`}
    >
      {!widget.enabled && <ComingSoonBadge />}
      <Icon name={widget.icon} className="text-primary" />
      <span className="text-on-surface-variant text-center">{widget.label}</span>
    </div>
  )
}

const CATEGORIES = ['Essential', 'Social & Media', 'Experimental']

export default function WidgetLibraryPanel({ onSelectTheme, currentTheme }) {
  const [tab, setTab] = useState('widgets')

  return (
    <div className="w-72 shrink-0 border-l border-[#262626] flex flex-col">
      <div className="flex border-b border-[#262626]">
        <button
          onClick={() => setTab('widgets')}
          className={`flex-1 py-3 text-sm font-medium transition ${tab === 'widgets' ? 'text-on-surface border-b-2 border-primary' : 'text-on-surface-variant'}`}
        >
          Widgets
        </button>
        <button
          onClick={() => setTab('theme')}
          className={`flex-1 py-3 text-sm font-medium transition ${tab === 'theme' ? 'text-on-surface border-b-2 border-primary' : 'text-on-surface-variant'}`}
        >
          Theme
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {tab === 'widgets'
          ? CATEGORIES.map((cat) => (
              <div key={cat} className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wide text-on-surface-variant">{cat}</span>
                <div className="grid grid-cols-2 gap-2">
                  {widgets.filter((w) => w.category === cat).map((w) => (
                    <WidgetCard key={w.id} widget={w} />
                  ))}
                </div>
              </div>
            ))
          : (
            <div className="flex flex-col gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  className={`text-left rounded-lg border p-3 text-sm transition ${
                    currentTheme === t.id ? 'border-primary bg-primary/10' : 'border-[#262626] hover:border-secondary'
                  }`}
                >
                  <span className="text-on-surface font-medium block">{t.name}</span>
                  <span className="text-xs text-on-surface-variant">{t.tagline}</span>
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
