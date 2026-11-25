"use client"

import { useUser } from "@/hooks/use-user"
import { useChannel } from "@/hooks/use-channel"
import { MainLayout } from "@/components/layout/main-layout"
import { MessageList } from "@/components/messaging/message-list"
import { ChannelHeader } from "@/components/messaging/channel-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ChannelPageProps {
  params: {
    channelId: string
  }
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const channelId = params.channelId
  const { user } = useUser()
  const { channel, isLoading: isLoadingChannel } = useChannel(channelId)

  if (isLoadingChannel || !channel) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  const currentUserId = user?.id || "user-1" // Fallback for demo

  return (
    <MainLayout>
      <ChannelHeader
        channelId={channel.id}
        channelName={channel.name}
        channelType={channel.is_private ? "private" : "public"}
      />
      <MessageList
        channelId={channel.id}
        currentUserId={currentUserId}
      />
    </MainLayout>
  )
}