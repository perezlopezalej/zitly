'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function MobileNav({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-6">
        {loggedIn ? (
          <Link
            href="/dashboard"
            className="text-sm font-medium px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
          >
            Ir al dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="text-sm text-brand-muted hover:text-brand-ink transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium px-4 py-2 bg-brand-ink text-white rounded-lg hover:bg-brand-green transition-colors"
            >
              Empieza gratis
            </Link>
          </>
        )}
      </nav>

      {/* Mobile hamburger */}
      <div ref={containerRef} className="sm:hidden relative">
        <button
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg text-brand-ink hover:text-brand-green hover:bg-brand-cream transition-colors"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="3" x2="15" y2="15" />
              <line x1="15" y1="3" x2="3" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="2" y1="5" x2="16" y2="5" />
              <line x1="2" y1="9" x2="16" y2="9" />
              <line x1="2" y1="13" x2="16" y2="13" />
            </svg>
          )}
        </button>

        <div
          className={`absolute right-0 top-[calc(100%+8px)] w-52 bg-brand-cream border border-brand-border rounded-xl shadow-lg overflow-hidden transition-all duration-200 ease-out origin-top-right ${
            open
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {loggedIn ? (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium text-brand-green hover:bg-[#EDEAE3] transition-colors"
            >
              Ir al dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block px-5 py-3.5 text-sm text-brand-ink hover:bg-[#EDEAE3] transition-colors"
              >
                Iniciar sesión
              </Link>
              <div className="border-t border-brand-border" />
              <Link
                href="/auth/register"
                onClick={() => setOpen(false)}
                className="block px-5 py-3.5 text-sm font-medium text-brand-green hover:bg-[#EDEAE3] transition-colors"
              >
                Empieza gratis →
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
