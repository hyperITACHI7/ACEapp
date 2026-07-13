import { useDroppable } from '@dnd-kit/core'
import Icon from '../Icon.jsx'

function SectionBlock({ section, active, onSelect }) {
  return (
    <div
      onClick={() => onSelect(section.id)}
      className={`rounded-xl border p-6 cursor-pointer transition ${
        active ? 'border-primary bg-primary/5' : 'border-[#262626] hover:border-secondary'
      }`}
    >
      <span className="text-xs uppercase tracking-widest text-on-surface-variant">{section.type}</span>
      <p className="mt-2 text-on-surface font-display text-lg">
        {section.content?.headline || section.content?.title || `${section.type} section`}
      </p>
      {section.content?.tagline && <p className="text-sm text-on-surface-variant mt-1">{section.content.tagline}</p>}
    </div>
  )
}

export default function EditorCanvas({ sections, activeId, onSelect }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop' })

  return (
    <div className="flex-1 min-w-0 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {sections.map((section) => (
          <SectionBlock key={section.id} section={section} active={section.id === activeId} onSelect={onSelect} />
        ))}

        <div
          ref={setNodeRef}
          className={`rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-2 text-sm transition ${
            isOver ? 'border-secondary bg-secondary-container/10' : 'border-[#262626] text-on-surface-variant'
          }`}
        >
          <Icon name="add_circle" />
          Drag a widget here to add a section
        </div>
      </div>
    </div>
  )
}
