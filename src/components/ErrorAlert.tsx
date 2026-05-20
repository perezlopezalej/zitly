export function ErrorAlert({
  message,
  compact = false,
}: {
  message: string
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-md bg-red-50 border border-red-200 ${compact ? 'px-3 py-2' : 'p-4'}`}
    >
      <p className="text-sm text-red-700">{message}</p>
    </div>
  )
}
