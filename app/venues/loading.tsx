export default function VenuesLoading() {
  return (
    <div className="py-20">
      <div className="container-narrow mb-16">
        <div className="h-3 w-16 bg-[var(--surface)] animate-pulse mb-4" />
        <div className="h-10 w-48 bg-[var(--surface)] animate-pulse mb-4" />
        <div className="h-px w-10 bg-[var(--gold-light)]" />
        <div className="h-4 w-80 bg-[var(--surface)] animate-pulse mt-6" />
      </div>
      <div className="container-wide grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden">
            <div className="aspect-video bg-[var(--surface)] animate-pulse" />
            <div className="p-6">
              <div className="h-6 w-40 bg-[var(--surface)] animate-pulse mb-3" />
              <div className="h-4 w-24 bg-[var(--surface)] animate-pulse mb-3" />
              <div className="h-4 w-full bg-[var(--surface)] animate-pulse mb-2" />
              <div className="h-4 w-3/4 bg-[var(--surface)] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
