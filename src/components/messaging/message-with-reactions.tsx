"use client"

import { useState } from "react"
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

  const handleReaction = async (emoji: string) => {
    if (loading) return

    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: currentUserId,
          emoji,
        })

      if (error) throw error

      if (hasReacted) {
        // Remove reaction
        const { error: deleteError } = await (supabase as any)
          .from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", currentUserId)
          .eq("emoji", emoji)

        if (deleteError) throw deleteError
      }

      setHasReacted(emoji)

      // Fetch updated reactions
      const { data, error: fetchError } = await (supabase as any)
        .from("message_reactions")
        .select("*")
        .eq("message_id", messageId)

      if (!fetchError && data) {
        setReactions(data as Reaction[])
      }
    } catch (error) {
      console.error("Error adding reaction:", error)
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
    <div className="border-b border-border pb-2">
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

          <p className="mt-1 text-sm">{content}</p>

          {/* Reactions Bar */}
          <div className="flex items-center gap-2 mt-2">
            {Object.entries(reactionCounts).map(([emoji, count]) => {
              const reactionInfo = quickReactions.find(r => r.emoji === emoji) || { emoji, label: emoji, icon: Smile, isLucide: true }
              const Icon = reactionInfo.isLucide ? reactionInfo.icon as React.ElementType : undefined
              const isOwn = hasReacted === emoji

              return (
                <TooltipProvider key={emoji}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleReaction(emoji)}
                        disabled={loading}
                        className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full transition-colors ${
                          isOwn
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {Icon ? <Icon className="h-3 w-3" /> : <span className="text-lg">{emoji}</span>}
                        <span>{count}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{reactionInfo.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}