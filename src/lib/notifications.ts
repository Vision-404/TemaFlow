import { supabase } from "./supabase"

/**
 * Fetch notifications for current user
 */
export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const updateData = { is_read: true, read_at: new Date().toISOString() }
  const { error } = await (supabase as any)
    .from("notifications")
    .update(updateData)
    .eq("id", notificationId)

  if (error) throw error
}

/**
 * Send a notification
 */
export async function sendNotification(params: {
  userId: string
  type: "message" | "mention" | "reaction" | "channel_joined" | "workspace_invite"
  title: string
  body: string
  data?: any
}): Promise<void> {
  const insertData = {
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data || null,
    is_read: false,
  }
  const { error } = await (supabase as any).from("notifications").insert(insertData)

  if (error) throw error
}