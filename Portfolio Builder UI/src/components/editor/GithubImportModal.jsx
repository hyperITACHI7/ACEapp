import Icon from '../Icon.jsx'
import { githubRepos } from '../../data/githubRepos.js'

export default function GithubImportModal({ open, onClose, onImport }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="glass-panel rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-on-surface">Import repositories</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <Icon name="close" />
          </button>
        </div>
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
          {githubRepos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => onImport(repo)}
              className="text-left rounded-lg border border-[#262626] p-3 hover:border-secondary transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface">{repo.name}</span>
                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                  <Icon name="star" className="text-[14px]" />
                  {repo.stars}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">{repo.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
