import { supabase } from "./supabase"

/**
 * Global search across channels and messages
 */
export async function globalSearch(workspaceId: string, query: string) {
  // Search messages
  const { data: messages, error: mError } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      channel:channel_id (
        id,
        name,
        workspace_id
      ),
      author:author_id (
        full_name
      )
    `)
    .textSearch("content", query)
    .filter("channel.workspace_id", "eq", workspaceId)

  if (mError) console.error("Search error:", mError)

  // Search channels
  const { data: channels, error: cError } = await supabase
    .from("channels")
    .select("id, name, description")
    .eq("workspace_id", workspaceId)
    .ilike("name", `%${query}%`)

  if (cError) console.error("Channel search error:", cError)

  return {
    messages: messages || [],
    channels: channels || [],
  }
}
