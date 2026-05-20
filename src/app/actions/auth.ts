'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export type AuthState = { error?: string } | undefined

export async function registerAction(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const businessName = formData.get('businessName') as string

  if (!email || !password || !businessName) {
    return { error: 'Todos los campos son obligatorios' }
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: businessName },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email ya está registrado' }
    }
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'No se pudo crear la cuenta. Inténtalo de nuevo.' }
  }

  // Requires email confirmation to be disabled in Supabase for the session
  // to be available immediately after signup.
  if (!data.session) {
    return {
      error:
        'Revisa tu bandeja de entrada y confirma tu email para continuar.',
    }
  }

  const { error: businessError } = await supabase
    .from('businesses')
    .insert({
      owner_id: data.user.id,
      name: businessName,
      category: 'general',
    })

  if (businessError) {
    return { error: 'Error al crear el negocio. Inténtalo de nuevo.' }
  }

  redirect('/dashboard')
}

export async function loginAction(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios' }
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (
      error.message.includes('Invalid login credentials') ||
      error.message.includes('invalid_credentials')
    ) {
      return { error: 'Email o contraseña incorrectos' }
    }
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
