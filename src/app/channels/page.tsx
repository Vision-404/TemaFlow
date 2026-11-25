"use client"

import { useChannels } from "@/hooks/use-channel"
import { MainLayout } from "@/components/layout/main-layout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ChannelHeader } from "@/components/messaging/channel-header"

export default function ChannelsPage() {
  const { channels, isLoading } = useChannels()

  if (isLoading || !channels) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  // Get the general channel ID
  const generalChannel = channels.find(c => c.is_general)
  const defaultChannelId = generalChannel?.id || "general"

  return (
    <MainLayout>
      <ChannelHeader
        channelId={defaultChannelId}
        channelName={generalChannel?.name || "General"}
        channelType={generalChannel?.is_private ? "private" : "public"}
      />
      <div className="flex-1 p-8 text-center">
        <p className="text-muted-foreground">
          Welcome to {generalChannel?.name || "General"}! Select a channel from the sidebar to start messaging.
        </p>
      </div>
    </MainLayout>
  )
}