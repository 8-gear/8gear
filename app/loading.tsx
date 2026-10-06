export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading page" className="min-h-[60vh] px-6 py-16 sm:px-10 lg:px-[72px]">
      <p role="status" className="mb-8 text-sm text-slate-500">Loading…</p>
      <div aria-hidden="true" className="animate-pulse space-y-8">
        <div className="h-10 w-64 max-w-full rounded bg-slate-100" />
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-[4/5] rounded-xl bg-slate-100" />)}
        </div>
      </div>
    </main>
  );
}
