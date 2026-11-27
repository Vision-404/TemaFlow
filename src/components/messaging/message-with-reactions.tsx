"use client"

import { useState, useEffect } from "react"
import { Heart, ThumbsUp, Smile } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabase"

interface Reaction {
  id: string
  emoji: string
  user_id: string
  created_at: string
}

interface UserInfo {
  full_name: string | null
  avatar_url: string | null
  email: string
}

interface MessageWithReactionsProps {
  messageId: string
  content: string
  authorInfo: UserInfo
  createdAt: string
  currentUserId: string
}

const quickReactions = [
  { emoji: "👍", label: "Like", icon: ThumbsUp, isLucide: true },
  { emoji: "❤️", label: "Love", icon: Heart, isLucide: true },
  { emoji: "😂", label: "Haha", icon: Smile, isLucide: true },
  { emoji: "😮", label: "Wow", icon: "😮", isLucide: false },
  { emoji: "😢", label: "Sad", icon: "😢", isLucide: false },
  { emoji: "😡", label: "Angry", icon: "😡", isLucide: false },
]

export function MessageWithReactions({
  messageId,
  content,
  authorInfo,
  createdAt,
  currentUserId,
}: MessageWithReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [hasReacted, setHasReacted] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch existing reactions on mount
  useEffect(() => {
    const fetchReactions = async () => {
      const { data, error } = await (supabase as any)
        .from("message_reactions")
        .select("*")
        .eq("message_id", messageId)

      if (!error && data) {
        setReactions(data as Reaction[])
      }

      // Check if current user has reacted
      const userReaction = (data as Reaction[] | null)?.find(
        (r) => r.user_id === currentUserId
      )
      if (userReaction) {
        setHasReacted(userReaction.emoji)
      }
    }

    fetchReactions()
  }, [messageId, currentUserId])

  const handleReaction = async (emoji: string) => {
    if (loading) return

    setLoading(true)
    try {
      // Check if user already reacted with this emoji
      const existingReaction = reactions.find(
        (r) => r.user_id === currentUserId && r.emoji === emoji
      )

      let newReactions: Reaction[]

      if (existingReaction) {
        // Remove reaction
        const { error: deleteError } = await (supabase as any)
          .from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", currentUserId)
          .eq("emoji", emoji)

        if (deleteError) throw deleteError

        newReactions = reactions.filter((r) => r.id !== existingReaction.id)
        setHasReacted(null)
      } else {
        // Add reaction
        const { error: insertError } = await (supabase as any)
          .from("message_reactions")
          .insert({
            message_id: messageId,
            user_id: currentUserId,
            emoji,
          })

        if (insertError) throw insertError

        // Fetch updated reactions
        const { data, error: fetchError } = await (supabase as any)
          .from("message_reactions")
          .select("*")
          .eq("message_id", messageId)

        if (fetchError) throw fetchError
        newReactions = data as Reaction[]
        setHasReacted(emoji)
      }

      setReactions(newReactions)
    } catch (error) {
      console.error("Error toggling reaction:", error)
    } finally {
      setLoading(false)
    }
  }

  // Count reactions by emoji
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="border-b border-border pb-2 last:border-b-0">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={authorInfo.avatar_url || ""} alt={authorInfo.full_name || ""} />
          <AvatarFallback>{authorInfo.full_name?.[0] || "?"}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {authorInfo.full_name || "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleString()}
            </span>
          </div>

          <p className="mt-1 text-sm break-words">{content}</p>

          {/* Reactions Bar */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {Object.entries(reactionCounts).map(([emoji, count]) => {
                const reactionInfo = quickReactions.find(r => r.emoji === emoji) || { emoji, label: emoji, icon: Smile, isLucide: true }
                const Icon = reactionInfo.isLucide ? reactionInfo.icon as React.ElementType : undefined
                const isOwn = hasReacted === emoji

                return (
                  <div key={emoji} className="relative">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleReaction(emoji)}
                            disabled={loading}
                            className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full transition-all duration-200 ${
                              isOwn
                                ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                                : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                            }`}
                          >
                            {Icon ? <Icon className="h-3 w-3" /> : <span className="text-sm">{emoji}</span>}
                            <span>{count}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {reactionInfo.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}