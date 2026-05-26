export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-28 bg-gray-200 rounded mb-6" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
