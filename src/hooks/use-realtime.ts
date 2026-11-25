"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type Message = {
  id: string
  channel_id: string
  content: string
  type: string
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string | null
  edited_at: string | null
  is_deleted: boolean
  author_id: string
  author?: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
  reactions?: Array<{
    id: string
    emoji: string
    user_id: string
  }>
}

export function useRealtimeMessages(channelId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!channelId) return

    // Initial fetch
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await (supabase as any)
          .from("messages")
          .select(`
            id,
            channel_id,
            content,
            type,
            metadata,
            created_at,
            updated_at,
            edited_at,
            is_deleted,
            author_id,
            author:author_id (
              id,
              email,
              full_name,
              avatar_url
            ),
            reactions (
              id,
              emoji,
              user_id
            )
          `)
          .eq("channel_id", channelId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true })

        if (error) throw error
        setMessages((data || []) as Message[])
      } catch (err) {
        console.error("Error fetching messages:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Realtime subscription for INSERT (new messages)
    const channel = (supabase as any)
      .channel(`channel:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload: { new: Message }) => {
          // Fetch the full message data with author info
          try {
            const { data, error } = await (supabase as any)
              .from("messages")
              .select(`
                id,
                channel_id,
                content,
                type,
                metadata,
                created_at,
                updated_at,
                edited_at,
                is_deleted,
                author:author_id (
                  id,
                  email,
                  full_name,
                  avatar_url
                ),
                reactions (
                  id,
                  emoji,
                  user_id
                )
              `)
              .eq("id", payload.new.id)
              .single()

            if (!error && data) {
              setMessages((prev) => [...prev, data as Message])
            }
          } catch (err) {
            console.error("Error handling real-time INSERT:", err)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload: { new: Partial<Message> }) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
          )
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload: { old: { id: string } }) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      ;(supabase as any).removeChannel(channel)
    }
  }, [channelId])

  return { messages, setMessages, isLoading }
}

export function useRealtimeReplies(messageId: string) {
  const [replies, setReplies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!messageId) return

    const fetchReplies = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await (supabase as any)
          .from("thread_replies")
          .select(`
            id,
            message_id,
            content,
            created_at,
            user_id,
            user:user_id (
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .eq("message_id", messageId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true })

        if (error) throw error
        setReplies((data || []).map((r: any) => ({
          ...r,
          user: r.user,
        })))
      } catch (err) {
        console.error("Error fetching replies:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReplies()

    return () => {
      // Cleanup subscription if needed
    }
  }, [messageId])

  return { replies, setReplies, isLoading }
}

export function useRealtimeChannelMembers(channelId: string) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!channelId) return

    const fetchMembers = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await (supabase as any)
          .from("channel_members")
          .select(`
            *,
            user:users (
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .eq("channel_id", channelId)

        if (error) throw error
        setMembers((data || []).map((m: any) => ({
          ...m,
          user: m.user,
        })))
      } catch (err) {
        console.error("Error fetching members:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()

    return () => {
      // Cleanup subscription if needed
    }
  }, [channelId])

  return { members, setMembers, isLoading }
}