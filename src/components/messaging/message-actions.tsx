"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Copy, Edit, Trash2, Bookmark, Flag } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface MessageActionsProps {
  messageId: string
  currentUserId: string
  authorId: string
  content: string
  onMessageUpdated?: () => void
}

export function MessageActions({
  messageId,
  currentUserId,
  authorId,
  content,
  onMessageUpdated,
}: MessageActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = messageId === currentUserId || authorId === currentUserId

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await (supabase as any)
        .from("messages")
        .update({ is_deleted: true })
        .eq("id", messageId)
        .eq("author_id", currentUserId)

      if (error) throw error
      onMessageUpdated?.()
    } catch (error) {
      console.error("Error deleting message:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          aria-label="Message actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bookmark className="h-4 w-4 mr-2" />
          Bookmark
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Flag className="h-4 w-4 mr-2" />
          Flag
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isAuthor && (
          <>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className={isDeleting ? "opacity-50" : ""}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}