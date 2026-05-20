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

  // M1: enforce password length server-side (HTML minLength is bypassable)
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' }
  }

  if (businessName.trim().length < 2 || businessName.trim().length > 100) {
    return { error: 'El nombre del negocio debe tener entre 2 y 100 caracteres' }
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: businessName.trim() },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email ya está registrado' }
    }
    // H2: never expose raw Supabase error messages to the client
    return { error: 'Error al crear la cuenta. Inténtalo de nuevo.' }
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
      name: businessName.trim(),
      category: 'general',
    })

  if (businessError) {
    // M3: if business creation fails, sign out so the user is not left in a
    // broken authenticated state without an associated business record.
    await supabase.auth.signOut()
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
    // H2: never expose raw Supabase error messages to the client
    return { error: 'Error al iniciar sesión. Inténtalo de nuevo.' }
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
