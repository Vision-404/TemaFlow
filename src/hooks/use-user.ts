"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type User = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: "owner" | "admin" | "member" | "guest" | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          const { data: profile, error } = await (supabase as any)
            .from("users")
            .select("id, email, full_name, avatar_url")
            .eq("id", authUser.id)
            .single()

          if (error && error.code !== "PGRST116") {
            console.error("Error fetching user profile:", error)
          }

          setUser({
            id: authUser.id,
            email: profile?.email ?? authUser.email ?? null,
            full_name: profile?.full_name ?? authUser.user_metadata?.full_name ?? null,
            avatar_url: profile?.avatar_url ?? authUser.user_metadata?.avatar_url ?? null,
            role: profile?.role ?? null
          })
        }
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await (supabase as any)
            .from("users")
            .select("id, email, full_name, avatar_url, role")
            .eq("id", session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: profile?.email ?? session.user.email ?? null,
            full_name: profile?.full_name ?? session.user.user_metadata?.full_name ?? null,
            avatar_url: profile?.avatar_url ?? session.user.user_metadata?.avatar_url ?? null,
            role: profile?.role ?? null
          })
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading }
}