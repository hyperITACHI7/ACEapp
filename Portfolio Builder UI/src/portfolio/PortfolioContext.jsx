import { createContext, useContext, useState } from 'react'

const PortfolioContext = createContext(null)
const STORAGE_KEY = 'aether_portfolios'

function loadAll() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : {}
}

function saveAll(all) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

const defaultSections = [
  { id: 's_hero', type: 'hero', order: 0, visible: true, content: { headline: 'Your Name', tagline: 'What you build' } },
  { id: 's_projects', type: 'projects', order: 1, visible: true, content: { title: 'Projects' } },
  { id: 's_contact', type: 'contact', order: 2, visible: true, content: { title: 'Get in touch' } },
]

function emptyPortfolio(id) {
  return {
    id,
    title: 'Untitled Portfolio',
    theme: 'developer-minimal',
    status: 'draft',
    sections: defaultSections,
  }
}

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState(null)

  const load = (id) => {
    const all = loadAll()
    const found = all[id] || emptyPortfolio(id)
    setPortfolio(found)
    return found
  }

  const createNew = (fromTemplateId) => {
    const id = 'p_' + Date.now()
    const next = emptyPortfolio(id)
    if (fromTemplateId) next.theme = fromTemplateId
    setPortfolio(next)
    return next
  }

  const updateSection = (sectionId, content) => {
    setPortfolio((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, content: { ...s.content, ...content } } : s)),
    }))
  }

  const addSection = (type, atIndex) => {
    setPortfolio((prev) => {
      const newSection = { id: 's_' + Date.now(), type, order: atIndex, visible: true, content: {} }
      const sections = [...prev.sections]
      sections.splice(atIndex, 0, newSection)
      return { ...prev, sections: sections.map((s, i) => ({ ...s, order: i })) }
    })
  }

  const removeSection = (sectionId) => {
    setPortfolio((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId).map((s, i) => ({ ...s, order: i })),
    }))
  }

  const reorderSections = (orderedIds) => {
    setPortfolio((prev) => {
      const byId = Object.fromEntries(prev.sections.map((s) => [s.id, s]))
      return { ...prev, sections: orderedIds.map((id, i) => ({ ...byId[id], order: i })) }
    })
  }

  const setTheme = (theme) => {
    setPortfolio((prev) => ({ ...prev, theme }))
  }

  const setTitle = (title) => {
    setPortfolio((prev) => ({ ...prev, title }))
  }

  const save = () => {
    setPortfolio((prev) => {
      const all = loadAll()
      all[prev.id] = prev
      saveAll(all)
      return prev
    })
  }

  const publish = () => {
    setPortfolio((prev) => {
      const published = { ...prev, status: 'published' }
      const all = loadAll()
      all[prev.id] = published
      saveAll(all)
      return published
    })
  }

  return (
    <PortfolioContext.Provider
      value={{ portfolio, load, createNew, updateSection, addSection, removeSection, reorderSections, setTheme, setTitle, save, publish }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  return useContext(PortfolioContext)
}

export function listPortfolios() {
  return Object.values(loadAll())
}
