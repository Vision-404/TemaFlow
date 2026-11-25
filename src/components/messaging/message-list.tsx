"use client"

import { useState, useEffect } from "react"
import { MessageWithReactions } from "@/components/messaging/message-with-reactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Smile, Paperclip } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Message {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  timestamp: string
  reactions?: { emoji: string; count: number }[]
  hasReply?: boolean
}

interface MessageListProps {
  channelId: string
  currentUserId: string
}

export function MessageList({ channelId, currentUserId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await (supabase as any)
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          is_deleted,
          author:author_id (
            id,
            email,
            full_name,
            avatar_url
          ),
          reactions (
            emoji,
            count
          )
        `)
        .eq("channel_id", channelId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })

      if (error) throw error

      const formattedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        author: {
          id: msg.author?.id || msg.author_id,
          name: msg.author?.full_name || "Anonymous",
          avatar: msg.author?.avatar_url || "",
        },
        timestamp: msg.created_at,
        reactions: msg.reactions?.reduce((acc: Record<string, number>, r: any) => {
          acc[r.emoji] = (acc[r.emoji] || 0) + 1
          return acc
        }, {}) as any,
        hasReply: msg.has_reply || false,
      }))

      setMessages(formattedMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const { error } = await (supabase as any)
        .from("messages")
        .insert({
          channel_id: channelId,
          author_id: currentUserId,
          content: newMessage,
        })

      if (error) throw error
      setNewMessage("")
      await fetchMessages()
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchMessages()
  }, [channelId])

  // Realtime subscription for new messages
  useEffect(() => {
    if (!currentUserId) return

    const channel = (supabase as any)
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
       {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload: { new: any }) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      ;(supabase as any).removeChannel(channel)
    }
  }, [channelId, currentUserId])

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageWithReactions
              key={message.id}
              messageId={message.id}
              content={message.content}
              authorInfo={{
                full_name: message.author.name,
                avatar_url: message.author.avatar,
                email: "",
              }}
              createdAt={message.timestamp}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      {/* Message Input */}
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
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
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
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="h-8 px-3"
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}