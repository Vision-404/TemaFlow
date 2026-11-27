"use client"

import { useState, useEffect } from "react"
import { Bell, X, MessageCircle, Users, Crown, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export type Notification = {
  id: string
  type: "message" | "mention" | "reaction" | "channel_joined" | "workspace_invite"
  title: string
  body: string
  data: {
    channel_id?: string
    channel_name?: string
    message_id?: string
    sender_id?: string
    sender_name?: string
    workspace_id?: string
    workspace_name?: string
  } | null
  is_read: boolean
  created_at: string
}

interface NotificationCenterProps {
  currentUserId: string
}

const notificationTypeConfig: Record<Notification["type"], { icon: React.ElementType; color: string }> = {
  message: { icon: MessageCircle, color: "blue" },
  mention: { icon: AlertCircle, color: "yellow" },
  reaction: { icon: Crown, color: "green" },
  channel_joined: { icon: Users, color: "green" },
  workspace_invite: { icon: Crown, color: "purple" },
}

export function NotificationCenter({ currentUserId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!currentUserId) return

    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const { data, error } = await (supabase as any)
          .from("notifications")
          .select("*")
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) throw error
        setNotifications(data || [])
        setUnreadCount((data || []).filter((n: Notification) => !n.is_read).length)
      } catch (err) {
        console.error("Error fetching notifications:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Realtime subscription for new notifications
    const channel = (supabase as any)
      .channel(`notifications:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload: { new: Notification }) => {
          setNotifications((prev) => [payload.new, ...prev])
          setUnreadCount((count) => count + 1)
        }
      )
      .subscribe()

    return () => {
      ;(supabase as any).removeChannel(channel)
    }
  }, [currentUserId])

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", currentUserId)

      if (error) throw error
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      setUnreadCount((count) => Math.max(0, count - 1))
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", currentUserId)
        .eq("is_read", false)

      if (error) throw error
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", currentUserId)

      if (error) throw error
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      if (!notifications.find((n) => n.id === notificationId)?.is_read) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }
    } catch (err) {
      console.error("Error deleting notification:", err)
    }
  }

  const formattedTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 1000 / 60)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs font-mono"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const Config = notificationTypeConfig[notification.type]
                const Icon = Config.icon
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors duration-200",
                      !notification.is_read && "bg-accent/30 border-l-2 border-primary"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 opacity-60" aria-hidden="true" />
                          <span
                            className={cn(
                              "font-medium text-sm cursor-pointer hover:underline",
                              !notification.is_read && "text-foreground"
                            )}
                            onClick={() => markAsRead(notification.id)}
                          >
                            {notification.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100 focus:opacity-100 focus:ring-2 focus:ring-primary"
                            onClick={() => markAsRead(notification.id)}
                            aria-label="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100 focus:opacity-100 focus:ring-2 focus:ring-destructive"
                            onClick={() => deleteNotification(notification.id)}
                            aria-label="Delete notification"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.body}
                      </p>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {formattedTime(notification.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                markAllAsRead()
                setOpen(false)
              }}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}