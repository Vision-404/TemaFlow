"use client"

import { Badge } from "@/components/ui/badge"

interface ChannelHeaderProps {
  channelId: string
  channelName?: string
  channelType?: "public" | "private" | "direct"
  unreadCount?: number
}

export function ChannelHeader({
  channelId,
  channelName = channelId,
  channelType = "public",
  unreadCount
}: ChannelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold">{channelName}</h1>
        {channelType !== "direct" && (
          <Badge variant="outline" className="text-xs">
            {channelType}
          </Badge>
        )}
        {unreadCount && unreadCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {unreadCount} unread
          </Badge>
        )}
      </div>
    </div>
  )
}