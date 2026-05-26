import { createSupabaseServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.user) {
      const { count } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', data.user.id)

      if ((count ?? 0) === 0) {
        const businessName = (data.user.user_metadata?.full_name as string | undefined) ?? 'Mi Negocio'
        await supabase.from('businesses').insert({
          owner_id: data.user.id,
          name: businessName,
          category: 'general',
        })
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
