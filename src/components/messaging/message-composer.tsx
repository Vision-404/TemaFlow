"use client"

import { useState, useRef } from "react"
import { Send, Smile, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

interface MessageComposerProps {
  channelId: string
  onMessageSent?: () => void
}

export function MessageComposer({ channelId, onMessageSent }: MessageComposerProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    if (!message.trim()) return

    try {
      const { error } = await (supabase as any)
        .from("messages")
        .insert({
          channel_id: channelId,
          author_id: (await supabase.auth.getUser()).data.user?.id,
          content: message.trim(),
          type: "text",
        })

      if (error) throw error

      setMessage("")
      setIsTyping(false)
      onMessageSent?.()
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `${channelId}/${fileName}`

      const { error: uploadError } = await (supabase as any)
        .storage
        .from("files")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Create message with file reference
      const { error: insertError } = await (supabase as any).from("messages").insert({
        channel_id: channelId,
        author_id: (await supabase.auth.getUser()).data.user?.id,
        content: file.name,
        type: "file",
        metadata: {
          storage_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          file_name: file.name,
        },
      })

      if (insertError) throw insertError

      onMessageSent?.()
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="border-t border-border p-4 bg-card">
      <form onSubmit={(e) => e.preventDefault()} className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,document/*"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleFileUpload}
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <Input
            type="text"
            placeholder="Message #general..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full text-sm"
            onFocus={() => setIsTyping(message.length > 0)}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Add emoji"
        >
          <Smile className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          size="icon"
          className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSend}
          disabled={!message.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {isTyping && (
        <div className="flex gap-1 mt-2 text-xs text-muted-foreground">
          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
      )}
    </div>
  )
}