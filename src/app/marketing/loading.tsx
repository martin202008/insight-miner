export default function Loading() {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="h-10 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-secondary/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
