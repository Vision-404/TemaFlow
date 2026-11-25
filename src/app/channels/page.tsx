import { redirect } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { ChannelHeader } from "@/components/messaging/channel-header"

interface Channel {
  id: string
  name: string
  is_general: boolean
  is_private: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string | null
  description: string | null
  member_count?: number
}

async function getChannels(): Promise<Channel[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/channels?order=created_at.asc`, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
    },
    next: { revalidate: 60 },
  })

  if (!response.ok) return []

  const data = await response.json()
  return data.filter((c: Channel) => !c.is_deleted)
}

export default async function ChannelsPage() {
  const channels = await getChannels()

  if (channels.length === 0) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No channels available</p>
        </div>
      </MainLayout>
    )
  }

  // Get the general channel ID
  const generalChannel = channels.find(c => c.is_general)
  const defaultChannelId = generalChannel?.id || channels[0].id
  const defaultChannel = generalChannel || channels[0]

  return (
    <MainLayout>
      <ChannelHeader
        channelId={defaultChannelId}
        channelName={defaultChannel.name}
        channelType={defaultChannel.is_private ? "private" : "public"}
      />
      <div className="flex-1 p-8 text-center">
        <p className="text-muted-foreground">
          Welcome to {defaultChannel.name}! Select a channel from the sidebar to start messaging.
        </p>
      </div>
    </MainLayout>
  )
}