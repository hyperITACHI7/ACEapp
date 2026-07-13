import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Icon from '../Icon.jsx'

function OutlineRow({ section, active, onSelect, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(section.id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition ${
        active ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-high/50'
      }`}
    >
      <span {...attributes} {...listeners} className="cursor-grab text-on-surface-variant">
        <Icon name="drag_indicator" />
      </span>
      <span className="flex-1 capitalize truncate">{section.type}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove(section.id)
        }}
        className="text-on-surface-variant hover:text-error"
      >
        <Icon name="close" />
      </button>
    </div>
  )
}

export default function SectionOutlinePanel({ sections, activeId, onSelect, onRemove }) {
  return (
    <div className="flex flex-col gap-1">
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        {sections.map((section) => (
          <OutlineRow key={section.id} section={section} active={section.id === activeId} onSelect={onSelect} onRemove={onRemove} />
        ))}
      </SortableContext>
    </div>
  )
}
