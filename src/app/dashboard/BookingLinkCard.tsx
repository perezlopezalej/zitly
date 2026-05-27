'use client'

import { useState } from 'react'

export function BookingLinkCard({ businessId }: { businessId: string }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')

  const url = `${baseUrl}/book/${businessId}`
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API not available in some contexts
    }
  }

  return (
    <div className="mb-8 bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-medium text-brand-muted uppercase tracking-wide mb-3">
        Tu enlace de reservas
      </p>
      <div className="flex items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          suppressHydrationWarning
          className="text-sm text-brand-ink font-mono truncate flex-1 bg-brand-cream rounded-lg px-3 py-2 min-w-0 hover:underline"
        >
          {url}
        </a>
        <button
          onClick={handleCopy}
          className="shrink-0 px-4 min-h-11 text-sm font-medium rounded-lg border border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-colors"
        >
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
