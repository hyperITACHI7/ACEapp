export default function LoadingSkeleton({ count = 3, className = 'h-40' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`rounded-xl bg-surface-container-high animate-pulse ${className}`} />
      ))}
    </>
  )
}
