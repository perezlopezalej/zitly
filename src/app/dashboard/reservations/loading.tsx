export default function Loading() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      <div className="h-6 w-28 bg-gray-200 rounded mb-5" />
      <div className="flex flex-wrap gap-2 mb-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-100 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
