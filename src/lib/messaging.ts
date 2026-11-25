import { supabase } from "./supabase"
import type { Database } from "@/types/database"

export type Channel = Database["public"]["Tables"]["channels"]["Row"]
export type Message = Database["public"]["Tables"]["messages"]["Row"]
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"]
export type ThreadReply = Database["public"]["Tables"]["thread_replies"]["Row"]

/**
 * Get channels for a workspace
 */
export async function getWorkspaceChannels(workspaceId: string) {
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_archived", false)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data
}

/**
 * Create a new channel
 */
export async function createChannel({
  workspaceId,
  name,
  description,
  type = "public",
  userId,
}: {
  workspaceId: string
  name: string
  description?: string
  type?: "public" | "private" | "dm" | "group"
  userId: string
}) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")

  const { data: channel, error } = await supabase
    .from("channels")
    .insert({
      workspace_id: workspaceId,
      name,
      slug,
      description: description || null,
      type,
      created_by: userId,
      member_count: 1,
    } as any)
    .select()
    .single()

  if (error) throw error

  // Add creator to channel members
  await supabase.from("channel_members").insert({
    channel_id: (channel as any).id,
    user_id: userId,
    role: "admin",
  } as any)

  return channel
}

/**
 * Get messages for a channel with author info and reactions
 */
export async function getChannelMessages(channelId: string, limit = 50) {
  const { data, error } = await supabase
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
    .eq("channel_id", channelId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Send a message
 */
export async function sendMessage({
  channelId,
  authorId,
  content,
  type = "text",
  metadata,
}: {
  channelId: string
  authorId: string
  content: string
  type?: "text" | "file" | "system"
  metadata?: Record<string, unknown>
}) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      channel_id: channelId,
      author_id: authorId,
      content,
      type,
      metadata: metadata || null,
    } as any)
    .select(`
      id,
      channel_id,
      content,
      type,
      metadata,
      created_at,
      author:author_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) throw error
  return data
}

/**
 * Add or remove a reaction
 */
export async function toggleReaction(messageId: string, userId: string, emoji: string) {
  // Check if reaction exists
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("message_id", messageId)
    .eq("user_id", userId)
    .eq("emoji", emoji)
    .single()

  if (existing) {
    // Delete reaction
    const { error } = await supabase
      .from("reactions")
      .delete()
      .eq("id", (existing as any).id)

    if (error) throw error
    return { action: "removed" }
  } else {
    // Add reaction
    const { data, error } = await supabase
      .from("reactions")
      .insert({
        message_id: messageId,
        user_id: userId,
        emoji,
      } as any)
      .select()
      .single()

    if (error) throw error
    return { action: "added", data }
  }
}

/**
 * Get thread replies for a message
 */
export async function getThreadReplies(messageId: string) {
  const { data, error } = await supabase
    .from("thread_replies")
    .select(`
      id,
      message_id,
      content,
      created_at,
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
  return data
}

/**
 * Send thread reply
 */
export async function sendThreadReply(messageId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from("thread_replies")
    .insert({
      message_id: messageId,
      user_id: userId,
      content,
    } as any)
    .select(`
      id,
      message_id,
      content,
      created_at,
      user:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) throw error
  return data
}
