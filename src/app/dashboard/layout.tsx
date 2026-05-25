import Link from 'next/link'
import { getBusiness } from '@/lib/actions'
import { logoutAction } from '@/app/actions/auth'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { businessName } = await getBusiness()

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shrink-0">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xl font-bold text-brand-green">Zitly</Link>
            <span className="text-gray-300 hidden sm:block">|</span>
            <span className="text-gray-700 font-medium text-sm hidden sm:block truncate max-w-48">
              {businessName}
            </span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md px-3 py-2.5 hover:bg-gray-50 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <DashboardSidebar />
        <main className="flex-1 p-6 pb-bottom-nav md:pb-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
