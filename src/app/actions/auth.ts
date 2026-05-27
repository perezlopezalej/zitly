'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { sendWelcomeEmail } from '@/lib/email'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import type { AuthState } from '@/types'

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

  // M1: enforce password complexity server-side (HTML constraints are bypassable)
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' }
  }
  if (!/[A-Z]/.test(password)) {
    return { error: 'La contraseña debe contener al menos una letra mayúscula' }
  }
  if (!/[0-9]/.test(password)) {
    return { error: 'La contraseña debe contener al menos un número' }
  }

  if (businessName.trim().length < 2 || businessName.trim().length > 100) {
    return { error: 'El nombre del negocio debe tener entre 2 y 100 caracteres' }
  }

  let supabase
  try {
    supabase = await createSupabaseServerClient()
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error al crear la cuenta. Inténtalo de nuevo.' }
  }

  const captchaToken = formData.get('captchaToken') as string | null
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: businessName.trim() },
      emailRedirectTo: `${appUrl}/auth/callback`,
      ...(captchaToken ? { captchaToken } : {}),
    },
  })

  if (error) {
    console.error('[register] signUp error:', error.status, error.message)
    // Coupled to Supabase error message string (tested against @supabase/ssr@0.10.3).
    // If upgrading Supabase, verify this string hasn't changed before deploying.
    if (error.message.includes('already registered')) {
      return { error: 'Este email ya está registrado' }
    }
    // H2: never expose raw Supabase error messages to the client
    return { error: 'Error al crear la cuenta. Inténtalo de nuevo.' }
  }

  // When email confirmation is required, Supabase returns session: null (and
  // possibly user: null). Check session first so the user sees the correct message.
  if (!data.session) {
    return {
      success:
        'Revisa tu bandeja de entrada y confirma tu email para continuar.',
    }
  }

  if (!data.user) {
    return { error: 'No se pudo crear la cuenta. Inténtalo de nuevo.' }
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

  await sendWelcomeEmail(email, businessName.trim()).catch((err) => console.error('[resend]', err))

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

  const captchaToken = formData.get('captchaToken') as string | null

  let supabase
  try {
    supabase = await createSupabaseServerClient()
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error al iniciar sesión. Inténtalo de nuevo.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    ...(captchaToken ? { options: { captchaToken } } : {}),
  })

  if (error) {
    if (
      error.message.includes('Invalid login credentials') ||
      error.message.includes('invalid_credentials')
    ) {
      return { error: 'Email o contraseña incorrectos' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.' }
    }
    // H2: never expose raw Supabase error messages to the client
    return { error: 'Error al iniciar sesión. Inténtalo de nuevo.' }
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function changePasswordAction(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword     = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Todos los campos son obligatorios' }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Las contraseñas nuevas no coinciden' }
  }
  if (newPassword.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' }
  }
  if (!/[A-Z]/.test(newPassword)) {
    return { error: 'La contraseña debe contener al menos una letra mayúscula' }
  }
  if (!/[0-9]/.test(newPassword)) {
    return { error: 'La contraseña debe contener al menos un número' }
  }

  let supabase
  try {
    supabase = await createSupabaseServerClient()
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/auth/login')

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) {
    return { error: 'La contraseña actual es incorrecta' }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) {
    return { error: 'Error al actualizar la contraseña. Inténtalo de nuevo.' }
  }

  return { success: 'Contraseña actualizada correctamente' }
}

export async function resetPasswordAction(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'El email es obligatorio' }
  }

  const captchaToken = formData.get('captchaToken') as string | null

  let supabase
  try {
    supabase = await createSupabaseServerClient()
  } catch (e) {
    if (isRedirectError(e)) throw e
    // Always return success to prevent email enumeration, even on client creation failure
    return {
      success: 'Si este email está registrado, recibirás un enlace en tu bandeja de entrada.',
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/reset-password/update`,
    ...(captchaToken ? { captchaToken } : {}),
  })

  if (resetError) {
    console.error('[resetPassword] error:', resetError.status, resetError.message)
  }

  // Always show success to prevent email enumeration
  return {
    success:
      'Si este email está registrado, recibirás un enlace en tu bandeja de entrada.',
  }
}

export async function updatePasswordAction(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const code = formData.get('code') as string
  const password = formData.get('password') as string

  if (!code || !password) {
    return { error: 'Datos incompletos. Usa el enlace del email.' }
  }

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' }
  }
  if (!/[A-Z]/.test(password)) {
    return { error: 'La contraseña debe contener al menos una letra mayúscula' }
  }
  if (!/[0-9]/.test(password)) {
    return { error: 'La contraseña debe contener al menos un número' }
  }

  let supabase
  try {
    supabase = await createSupabaseServerClient()
  } catch (e) {
    if (isRedirectError(e)) throw e
    return { error: 'Error de conexión. Inténtalo de nuevo.' }
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    return { error: 'El enlace ha expirado o ya fue usado. Solicita uno nuevo.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    return { error: 'Error al actualizar la contraseña. Inténtalo de nuevo.' }
  }

  redirect('/dashboard')
}
