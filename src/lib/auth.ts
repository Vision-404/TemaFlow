import { supabase } from "./supabase"

export type AuthUser = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  organization_id: string | null
  role: "owner" | "admin" | "member" | "guest" | null
}

/**
 * Sign up a new user
 */
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) throw error
  return data
}

/**
 * Sign in a user
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Sign in with magic link
 */
export const signInWithMagicLink = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/callback`,
    },
  })

  if (error) throw error
  return data
}

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get the current user with organization info
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()

  if (!supabaseUser) return null

  // Get user profile from database
  const { data: userProfile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", supabaseUser.id)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user profile:", error)
  }

  const profileData = userProfile as any || {}
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: profileData.full_name ?? (supabaseUser.user_metadata?.full_name as string | null) ?? null,
    avatar_url: profileData.avatar_url ?? (supabaseUser.user_metadata?.avatar_url as string | null) ?? null,
    organization_id: profileData.organization_id ?? null,
    role: profileData.role ?? null,
  } as AuthUser
}

/**
 * Get user session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

/**
 * Listen to auth changes
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Update user profile
 */
export const updateProfile = async (updates: Partial<{
  full_name: string
  avatar_url: string
  role: "owner" | "admin" | "member" | "guest"
}>) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  })

  if (error) throw error
  return data
}