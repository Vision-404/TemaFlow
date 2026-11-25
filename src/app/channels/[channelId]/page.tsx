import { MainLayout } from "@/components/layout/main-layout"
import { ChannelHeader } from "@/components/messaging/channel-header"

interface ChannelPageProps {
  params: {
    channelId: string
  }
}

async function getChannel(channelId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/channels?id=eq.${channelId}`, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
    },
    next: { revalidate: 60 },
  })
  if (!response.ok) return null
  const data = await response.json()
  return data[0] || null
}

async function getChannelMessages(channelId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?channel_id=eq.${channelId}&order=created_at.asc`, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
    },
    next: { revalidate: 60 },
  })
  if (!response.ok) return []
  return await response.json()
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const channelId = params.channelId
  const channel = await getChannel(channelId)

  if (!channel) {
    return (
      <MainLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Channel not found</p>
        </div>
      </MainLayout>
    )
  }

  const messages = await getChannelMessages(channelId)

  return (
    <MainLayout>
      <ChannelHeader
        channelId={channel.id}
        channelName={channel.name}
        channelType={channel.is_private ? "private" : "public"}
      />
      <div className="flex-1 p-8">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: any) => (
              <div key={msg.id} className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {msg.created_at}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}