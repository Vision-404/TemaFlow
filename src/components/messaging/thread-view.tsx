"use client"

import { useState, useEffect } from "react"
import { MessageWithReactions } from "@/components/messaging/message-with-reactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Send, Smile, Paperclip } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ThreadReply {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  timestamp: string
  reactions?: { emoji: string; count: number }[]
}

interface ThreadViewProps {
  messageId: string
  channelId: string
  currentUserId: string
  messageContent: string
  messageAuthor: {
    id: string
    name: string
    avatar: string
  }
  messageTimestamp: string
  onClose?: () => void
}

export function ThreadView({
  messageId,
  channelId,
  currentUserId,
  messageContent,
  onClose,
}: ThreadViewProps) {
  const [replies, setReplies] = useState<ThreadReply[]>([])
  const [newReply, setNewReply] = useState("")
  const [loading, setLoading] = useState(true)

  // Fetch replies
  const fetchReplies = async () => {
    setLoading(true)
    try {
      const { data, error } = await (supabase as any)
        .from("thread_replies")
        .select(`
          id,
          content,
          created_at,
          author:author_id (
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

      const formattedReplies: ThreadReply[] = (data || []).map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        author: {
          id: reply.author?.id || reply.author_id,
          name: reply.author?.full_name || "Anonymous",
          avatar: reply.author?.avatar_url || "",
        },
        timestamp: reply.created_at,
      }))

      setReplies(formattedReplies)
    } catch (error) {
      console.error("Error fetching replies:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReplies()
  }, [messageId])

  // Realtime subscription for new replies
  useEffect(() => {
    if (!currentUserId) return

    const channel = (supabase as any)
      .channel(`thread_replies:${messageId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "thread_replies",
          filter: `message_id=eq.${messageId}`,
        },
        (payload: { new: any }) => {
          const newReply = payload.new
          // Format the reply similar to fetchReplies
          const formattedReply: ThreadReply = {
            id: newReply.id,
            content: newReply.content,
            author: {
              id: newReply.author?.id || newReply.author_id,
              name: newReply.author?.full_name || "Anonymous",
              avatar: newReply.author?.avatar_url || "",
            },
            timestamp: newReply.created_at,
          }
          setReplies((prev) => [...prev, formattedReply])
        }
      )
      .subscribe()

    return () => {
      ;(supabase as any).removeChannel(channel)
    }
  }, [messageId, currentUserId])

  const handleSendReply = async () => {
    if (!newReply.trim()) return

    try {
      const { error } = await (supabase as any)
        .from("thread_replies")
        .insert({
          message_id: messageId,
          channel_id: channelId,
          author_id: currentUserId,
          content: newReply,
        })

      if (error) throw error
      setNewReply("")
      await fetchReplies()
    } catch (error) {
      console.error("Error sending reply:", error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-1 mr-2"
          onClick={onClose}
          aria-label="Back to channel"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h3 className="font-medium">Thread</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {messageContent}
          </p>
        </div>
      </div>

      {/* Replies */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading replies...</p>
          </div>
        ) : replies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No replies yet. Be the first to reply!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => (
              <MessageWithReactions
                key={reply.id}
                messageId={reply.id}
                content={reply.content}
                authorInfo={{
                  full_name: reply.author.name,
                  avatar_url: reply.author.avatar,
                  email: "",
                }}
                createdAt={reply.timestamp}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply Input */}
      <div className="p-4 border-t">
        <div className="flex items-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <Input
              type="text"
              placeholder="Write a reply..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendReply()
                }
              }}
              className="w-full"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleSendReply}
            disabled={!newReply.trim()}
            className="h-8 px-3"
          >
            <Send className="h-4 w-4 mr-1" />
            Reply
          </Button>
        </div>
      </div>
    </div>
  )
}