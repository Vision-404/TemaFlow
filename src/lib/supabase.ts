import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== "undefined"
      ? localStorage
      : undefined,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      events: ["INSERT", "UPDATE", "DELETE"],
    },
  },
  global: {
    headers: {
      "x-supabase-db-version": "0.0.1",
    },
  },
})

// Helper to get the current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Helper to get the current user
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper to listen to auth changes
export const onAuthChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}