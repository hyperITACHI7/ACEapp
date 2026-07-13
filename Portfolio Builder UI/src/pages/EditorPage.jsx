import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import Icon from '../components/Icon.jsx'
import PortfolioHealthScore from '../components/PortfolioHealthScore.jsx'
import SectionOutlinePanel from '../components/editor/SectionOutlinePanel.jsx'
import EditorCanvas from '../components/editor/EditorCanvas.jsx'
import WidgetLibraryPanel from '../components/editor/WidgetLibraryPanel.jsx'
import GithubImportModal from '../components/editor/GithubImportModal.jsx'
import { usePortfolio } from '../portfolio/PortfolioContext.jsx'

export default function EditorPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { portfolio, load, createNew, addSection, removeSection, reorderSections, setTheme, save, publish } = usePortfolio()
  const [activeId, setActiveId] = useState(null)
  const [githubOpen, setGithubOpen] = useState(false)

  useEffect(() => {
    if (id) {
      load(id)
    } else {
      createNew(searchParams.get('template'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (portfolio?.sections?.length) setActiveId(portfolio.sections[0].id)
  }, [portfolio?.id])

  if (!portfolio) return null

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return

    if (typeof active.id === 'string' && active.id.startsWith('widget-') && over.id === 'canvas-drop') {
      const type = active.id.replace('widget-', '')
      addSection(type, portfolio.sections.length)
      return
    }

    if (active.id !== over.id) {
      const ids = portfolio.sections.map((s) => s.id)
      const oldIndex = ids.indexOf(active.id)
      const newIndex = ids.indexOf(over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSections(arrayMove(ids, oldIndex, newIndex))
      }
    }
  }

  const handleSaveExit = () => {
    save()
    navigate('/dashboard')
  }

  const handlePreview = () => {
    save()
    navigate(`/preview/${portfolio.id}`)
  }

  const handlePublish = () => {
    publish()
    navigate('/dashboard')
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between border-b border-[#262626] px-6 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={handleSaveExit} className="text-on-surface-variant hover:text-on-surface">
              <Icon name="arrow_back" />
            </button>
            <span className="font-display font-semibold text-on-surface">{portfolio.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <PortfolioHealthScore value={78} size={40} />
            <button
              onClick={() => setGithubOpen(true)}
              className="rounded-lg border border-[#262626] text-on-surface text-sm font-medium px-4 py-2 hover:border-secondary transition"
            >
              Import from GitHub
            </button>
            <button
              onClick={handlePreview}
              className="rounded-lg border border-[#262626] text-on-surface text-sm font-medium px-4 py-2 hover:border-secondary transition"
            >
              Preview
            </button>
            <button
              onClick={handlePublish}
              className="rounded-lg bg-white text-[#0a0a0a] text-sm font-semibold px-4 py-2 hover:opacity-90 transition"
            >
              Publish
            </button>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
          <aside className="w-64 shrink-0 border-r border-[#262626] p-4 overflow-y-auto">
            <span className="text-xs uppercase tracking-wide text-on-surface-variant block mb-3">Sections</span>
            <SectionOutlinePanel
              sections={portfolio.sections}
              activeId={activeId}
              onSelect={setActiveId}
              onRemove={removeSection}
            />
          </aside>

          <EditorCanvas sections={portfolio.sections} activeId={activeId} onSelect={setActiveId} />

          <WidgetLibraryPanel onSelectTheme={setTheme} currentTheme={portfolio.theme} />
        </div>
      </div>

      <GithubImportModal
        open={githubOpen}
        onClose={() => setGithubOpen(false)}
        onImport={() => setGithubOpen(false)}
      />
    </DndContext>
  )
}
