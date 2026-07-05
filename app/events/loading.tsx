export default function EventsLoading() {
  return (
    <div className="py-20">
      <div className="container-narrow mb-12">
        <div className="h-3 w-16 bg-[var(--surface)] animate-pulse mb-4" />
        <div className="h-10 w-40 bg-[var(--surface)] animate-pulse mb-4" />
        <div className="h-px w-10 bg-[var(--gold-light)]" />
      </div>
      <div className="container-narrow mb-10">
        <div className="flex gap-6 border-b border-[var(--border-color)] pb-3">
          <div className="h-4 w-20 bg-[var(--surface)] animate-pulse" />
          <div className="h-4 w-16 bg-[var(--surface)] animate-pulse" />
        </div>
      </div>
      <div className="container-wide grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden">
            <div className="aspect-video bg-[var(--surface)] animate-pulse" />
            <div className="p-5">
              <div className="h-3 w-28 bg-[var(--surface)] animate-pulse mb-3" />
              <div className="h-5 w-full bg-[var(--surface)] animate-pulse mb-2" />
              <div className="h-5 w-2/3 bg-[var(--surface)] animate-pulse mb-4" />
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-[var(--surface)] animate-pulse" />
                <div className="h-4 w-10 bg-[var(--surface)] animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
