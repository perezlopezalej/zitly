export function SuccessAlert({
  message,
  compact = false,
}: {
  message: string
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-md bg-green-50 border border-green-200 ${compact ? 'px-3 py-2' : 'p-4'}`}
    >
      <p className="text-sm text-green-700">{message}</p>
    </div>
  )
}
