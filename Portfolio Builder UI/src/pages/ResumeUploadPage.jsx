import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'

const MAX_SIZE_MB = 5

export default function ResumeUploadPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const validate = (candidate) => {
    if (!candidate) return
    const isPdf = candidate.type === 'application/pdf'
    const tooBig = candidate.size > MAX_SIZE_MB * 1024 * 1024
    if (!isPdf) {
      setError('Only PDF files are supported. Please upload a .pdf resume.')
      setFile(null)
      return
    }
    if (tooBig) {
      setError(`File is too large. Please keep it under ${MAX_SIZE_MB}MB.`)
      setFile(null)
      return
    }
    setError('')
    setFile(candidate)
  }

  const handleContinue = () => {
    navigate('/onboarding/recommendations')
  }

  return (
    <div className="glass-panel rounded-2xl p-10 flex flex-col items-center gap-6 text-center">
      <h1 className="font-display text-3xl font-semibold text-on-surface">Upload your resume</h1>
      <p className="text-on-surface-variant max-w-md">
        We&apos;ll use it to pre-fill your portfolio and recommend the best-fit theme. You can skip this and add content manually later.
      </p>

      <div
        className={`w-full rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-3 transition ${
          error ? 'border-error' : 'border-[#262626]'
        }`}
      >
        <Icon name={error ? 'error' : 'upload_file'} className={error ? 'text-error' : 'text-secondary'} />
        {file ? (
          <p className="text-sm text-on-surface">{file.name}</p>
        ) : (
          <p className="text-sm text-on-surface-variant">Drag &amp; drop your resume, or</p>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-[#262626] text-on-surface text-sm font-medium px-4 py-2 hover:border-secondary transition"
        >
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => validate(e.target.files?.[0])}
        />
        {error && <p className="text-sm text-error mt-1">{error}</p>}
      </div>

      <div className="flex gap-3 mt-2">
        <button
          onClick={handleContinue}
          className="text-sm text-on-surface-variant hover:text-on-surface transition px-4 py-2"
        >
          Skip for now
        </button>
        <button
          onClick={handleContinue}
          disabled={!file}
          className="rounded-lg bg-white text-[#0a0a0a] font-semibold px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
