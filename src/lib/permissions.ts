import { supabase } from "./supabase"

export type Role = "owner" | "admin" | "member" | "guest"

export interface Permission {
  subject: string
  actions: string[]
  conditions?: Record<string, unknown>
}

export interface UserPermissions {
  roles: Role[]
  permissions: Permission[]
  organizations: string[]
  workspaces: string[]
}

// Permission definitions
export const PERMISSIONS = {
  // Organization permissions
  ORGANIZATION_READ: "organization:read",
  ORGANIZATION_WRITE: "organization:write",
  ORGANIZATION_DELETE: "organization:delete",

  // Workspace permissions
  WORKSPACE_READ: "workspace:read",
  WORKSPACE_WRITE: "workspace:write",
  WORKSPACE_DELETE: "workspace:delete",
  WORKSPACE_INVITE: "workspace:invite",

  // Channel permissions
  CHANNEL_READ: "channel:read",
  CHANNEL_WRITE: "channel:write",
  CHANNEL_CREATE: "channel:create",
  CHANNEL_DELETE: "channel:delete",
  CHANNEL_ARCHIVE: "channel:archive",

  // Message permissions
  MESSAGE_READ: "message:read",
  MESSAGE_WRITE: "message:write",
  MESSAGE_DELETE: "message:delete",
  MESSAGE_EDIT: "message:edit",
  MESSAGE_REACT: "message:react",
  MESSAGE_THREAD: "message:thread",

  // User permissions
  USER_READ: "user:read",
  USER_KICK: "user:kick",
  USER_BAN: "user:ban",
} as const

// Role-based permission definitions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    { subject: "organization", actions: ["*"] },
    { subject: "workspace", actions: ["*"] },
    { subject: "channel", actions: ["*"] },
    { subject: "message", actions: ["*"] },
    { subject: "user", actions: ["*"] },
  ],
  admin: [
    { subject: "organization", actions: ["read", "write"] },
    { subject: "workspace", actions: ["read", "write", "invite"] },
    { subject: "channel", actions: ["read", "write", "create", "delete", "archive"] },
    { subject: "message", actions: ["read", "write", "delete", "edit", "react", "thread"] },
    { subject: "user", actions: ["read", "kick"] },
  ],
  member: [
    { subject: "organization", actions: ["read"] },
    { subject: "workspace", actions: ["read"] },
    { subject: "channel", actions: ["read", "write"] },
    { subject: "message", actions: ["read", "write", "react", "thread"] },
    { subject: "user", actions: ["read"] },
  ],
  guest: [
    { subject: "organization", actions: [] },
    { subject: "workspace", actions: ["read"] },
    { subject: "channel", actions: ["read"] },
    { subject: "message", actions: ["read"] },
    { subject: "user", actions: [] },
  ],
}

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  userRole: Role | null,
  subject: string,
  action: string
): boolean => {
  if (!userRole) return false

  const permissions = ROLE_PERMISSIONS[userRole] || []

  for (const permission of permissions) {
    if (permission.subject === subject) {
      if (permission.actions.includes("*") || permission.actions.includes(action)) {
        return true
      }
    }
  }

  return false
}

/**
 * Check if user can access a resource (RLS-aware)
 */
export const canAccessOrganization = async (
  userId: string,
  organizationId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("membership")
    .select("role")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .single()

  if (error) return false
  return data !== null
}

/**
 * Check if user is a member of a channel
 */
export const isChannelMember = async (
  userId: string,
  channelId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("channel_members")
    .select("id")
    .eq("user_id", userId)
    .eq("channel_id", channelId)
    .single()

  if (error) return false
  return data !== null
}

/**
 * Check if user can write to a channel
 */
export const canWriteToChannel = async (
  userId: string,
  channelId: string
): Promise<boolean> => {
  const { data: channel, error: channelError } = await supabase
    .from("channels")
    .select("type, is_archived")
    .eq("id", channelId)
    .single()

  if (channelError || !channel) return false

  // Public channels are readable but may require membership to write
  if ((channel as any).type === "public") {
    return true
  }

  // Check membership for private channels
  return isChannelMember(userId, channelId)
}

/**
 * Validate and sanitize input
 */
export const validateInput = (input: string, maxLength: number = 1000): boolean => {
  if (!input || typeof input !== "string") return false
  if (input.length > maxLength) return false
  return true
}

/**
 * Get user permissions for a given context
 */
export const getUserPermissions = async (
  _userId: string,
  organizationId?: string,
  workspaceId?: string
): Promise<UserPermissions | null> => {
  let query = supabase.from("membership").select("role, organization_id") as any

  if (organizationId) {
    query = query.eq("organization_id", organizationId)
  }

  const { data: memberships, error } = await query

  if (error || !memberships || memberships.length === 0) return null

  const roles = (memberships as any).map((m: any) => m.role)
  const primaryRole = roles[0] as Role // Could be enhanced with role hierarchy

  // Get workspace memberships
  let workspaceQuery = supabase.from("workspaces").select("id").eq("organization_id", organizationId || "")
  if (workspaceId) {
    workspaceQuery = workspaceQuery.eq("id", workspaceId)
  }

  const { data: workspaces, error: workspaceError } = await workspaceQuery

  if (workspaceError) return null

  const permissions = ROLE_PERMISSIONS[primaryRole] || []

  return {
    roles,
    permissions,
    organizations: (memberships as any).map((m: any) => m.organization_id),
    workspaces: (workspaces as any)?.map((w: any) => w.id) || [],
  }
}