"use client"

import { useState, useEffect } from "react"
import { Shield, UserMinus, Crown, Star } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

interface Member {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  role: "owner" | "admin" | "member" | "guest"
  joined_at: string
}

interface MemberListProps {
  channelId: string
  currentUserId: string
}

const roleConfig = {
  owner: { label: "Owner", icon: Crown, color: "purple" },
  admin: { label: "Admin", icon: Shield, color: "blue" },
  member: { label: "Member", icon: Shield, color: "green" },
  guest: { label: "Guest", icon: Star, color: "gray" },
}

export function MemberList({ channelId, currentUserId }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      try {
        // First get channel members
        const { data: channelMembers, error: cmError } = await (supabase as any)
          .from("channel_members")
          .select("*")
          .eq("channel_id", channelId)

        if (cmError) throw cmError

        if (!channelMembers || channelMembers.length === 0) {
          setMembers([])
          setLoading(false)
          return
        }

        // Get user IDs
        const userIds = channelMembers.map((m: any) => m.user_id)

        // Then get user details for each member
        const { data: users, error: uError } = await (supabase as any)
          .from("users")
          .select("id, full_name, email, avatar_url")
          .in("id", userIds)

        if (uError) throw uError

        // Combine data
        const combinedMembers: Member[] = (users || []).map((user: any) => {
          const cm = channelMembers.find((m: any) => m.user_id === user.id)
          return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            avatar_url: user.avatar_url,
            role: (cm?.role as Member["role"]) || "member",
            joined_at: cm?.joined_at || new Date().toISOString(),
          }
        })

        setMembers(combinedMembers)
      } catch (error) {
        console.error("Error fetching members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [channelId])

  const handleRemoveMember = async (userId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("channel_members")
        .delete()
        .eq("channel_id", channelId)
        .eq("user_id", userId)

      if (error) throw error
      setMembers((prev) => prev.filter((m) => m.id !== userId))
    } catch (error) {
      console.error("Error removing member:", error)
    }
  }

  const filteredMembers = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  )

  const currentMember = members.find((m) => m.id === currentUserId)
  const isMemberAdmin = currentMember?.role === "admin" || currentMember?.role === "owner"

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading members...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((member) => {
            const RoleIcon = roleConfig[member.role].icon
            const roleColor = roleConfig[member.role].color

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url || ""} alt={member.full_name || ""} />
                    <AvatarFallback>
                      {member.full_name?.[0] || (member.email?.[0]?.toUpperCase() ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {member.full_name || "Anonymous"}
                      {member.id === currentUserId && (
                        <span className="text-xs text-muted-foreground ml-2">(You)</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={roleColor === "purple" ? "default" : roleColor === "blue" ? "outline" : "secondary"}
                    className="text-xs"
                  >
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {roleConfig[member.role].label}
                  </Badge>

                  {isMemberAdmin && member.id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}