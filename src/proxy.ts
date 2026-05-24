import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// M4: validated at module load — crashes early with a clear message if missing
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies so refreshed session is visible downstream
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // Rebuild response to include updated Set-Cookie headers
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Validates the session token against Supabase servers (not just the local JWT),
  // so a forged or revoked cookie cannot bypass this redirect guard.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
