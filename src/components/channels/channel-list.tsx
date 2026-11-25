"use client"

import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Hash, MessageCircle, Users, Shield, ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface Channel {
  id: string
  name: string
  type: "channel" | "dm" | "group"
  isPrivate?: boolean
  isGeneral?: boolean
  isActive?: boolean
  memberCount?: number
  createdAt?: string
}

interface ChannelListProps {
  currentChannelId?: string
}

export function ChannelList({ currentChannelId }: ChannelListProps) {
  const [showDirectMessages, setShowDirectMessages] = useState(false)

  const publicChannels: Channel[] = [
    { id: "general", name: "General", type: "channel", isGeneral: true, isActive: true },
    { id: "random", name: "Random", type: "channel" },
    { id: "announcements", name: "Announcements", type: "channel", isPrivate: true },
    { id: "engineering", name: "Engineering", type: "channel" },
    { id: "design", name: "Design", type: "channel" },
    { id: "marketing", name: "Marketing", type: "channel" },
  ]

  const directMessages: Channel[] = [
    { id: "dm-alice", name: "Alice Johnson", type: "dm" },
    { id: "dm-bob", name: "Bob Smith", type: "dm" },
    { id: "team-alpha", name: "Team Alpha", type: "group", memberCount: 5 },
    { id: "project-phoenix", name: "Project Phoenix", type: "group", memberCount: 8 },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Public Channels Header */}
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Channels
        </h3>
      </div>

      {/* Public Channels */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 px-2">
          {publicChannels.map((channel) => (
            <TooltipProvider key={channel.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/channels/${channel.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium",
                      "hover:bg-accent hover:text-accent-foreground",
                      currentChannelId === channel.id && "bg-accent text-accent-foreground",
                      "transition-colors"
                    )}
                  >
                    {channel.isGeneral && <Hash className="h-4 w-4" />}
                    {!channel.isGeneral && <Hash className="h-4 w-4 opacity-60" />}
                    <span>{channel.name}</span>
                    {channel.isPrivate && (
                      <Shield className="ml-auto h-3 w-3 opacity-60" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {channel.isGeneral ? "General channel (default)" : `#${channel.name}`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
      </ScrollArea>

      {/* Direct Messages Header */}
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
          onClick={() => setShowDirectMessages(!showDirectMessages)}
        >
          <span>Direct Messages</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              showDirectMessages && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Direct Messages */}
      {showDirectMessages && (
        <ScrollArea>
          <nav className="space-y-1 px-2">
            {directMessages.map((channel) => (
              <TooltipProvider key={channel.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/channels/${channel.id}`}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium",
                        "hover:bg-accent hover:text-accent-foreground",
                        currentChannelId === channel.id && "bg-accent text-accent-foreground",
                        "transition-colors"
                      )}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="flex-1 truncate">
                        {channel.name}
                        {channel.memberCount && channel.type === "group" && (
                          <span className="text-xs opacity-60"> ({channel.memberCount})</span>
                        )}
                      </span>
                      {channel.type === "dm" && (
                        <Badge variant="secondary" className="ml-auto h-4 px-1.5 text-xs">
                          YOU
                        </Badge>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {channel.type === "dm" ? `DM with ${channel.name}` : `#${channel.name}`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </nav>
        </ScrollArea>
      )}

      {/* Invite Button */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-md px-3 py-1.5 text-sm font-medium hover:bg-accent"
        >
          <Users className="h-4 w-4 mr-3" />
          Invite People
        </Button>
      </div>
    </div>
  )
}