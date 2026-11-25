"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type Channel = {
  id: string
  name: string
  type: "public" | "private" | "direct"
  is_general: boolean
  is_private: boolean
  description: string | null
  created_at: string
  updated_at: string | null
  member_count?: number
}

export function useChannel(channelId: string) {
  const [channel, setChannel] = useState<Channel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!channelId) {
      setIsLoading(false)
      return
    }

    const fetchChannel = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await (supabase as any)
          .from("channels")
          .select("*")
          .eq("id", channelId)
          .eq("is_deleted", false)
          .single()

        if (error) throw error
        setChannel(data as Channel)
      } catch (err) {
        setError(err as Error)
        console.error("Error fetching channel:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChannel()
  }, [channelId])

  return { channel, isLoading, error }
}

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await (supabase as any)
          .from("channels")
          .select("*")
          .eq("is_deleted", false)
          .order("created_at", { ascending: true })

        if (error) throw error
        setChannels(data as Channel[])
      } catch (err) {
        setError(err as Error)
        console.error("Error fetching channels:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChannels()
  }, [])

  return { channels, isLoading, error }
}