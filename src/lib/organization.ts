import { supabase } from "./supabase"
import type { Database } from "@/types/database"

export type Organization = Database["public"]["Tables"]["organizations"]["Row"]
export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"]
export type Membership = Database["public"]["Tables"]["membership"]["Row"]

/**
 * Fetch all organizations for a user
 */
export async function getUserOrganizations(userId: string) {
  const { data, error } = await supabase
    .from("membership")
    .select(`
      role,
      organizations:organization_id (
        id,
        name,
        slug,
        description,
        logo_url,
        owner_id,
        created_at
      )
    `)
    .eq("user_id", userId)

  if (error) throw error
  return data
}

/**
 * Create a new organization
 */
export async function createOrganization(name: string, slug: string, userId: string, description?: string) {
  // 1. Create org
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      slug,
      owner_id: userId,
      description: description || null,
    } as any)
    .select()
    .single()

  if (orgError) throw orgError

  // 2. Add owner membership
  const { error: memberError } = await supabase
    .from("membership")
    .insert({
      organization_id: (org as any).id,
      user_id: userId,
      role: "owner",
    } as any)

  if (memberError) console.error("Error creating owner membership:", memberError)

  // 3. Create default workspace
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({
      organization_id: (org as any).id,
      name: "General",
      slug: "general",
      description: "Default workspace",
      role: "owner",
      member_count: 1,
    } as any)
    .select()
    .single()

  if (wsError) console.error("Error creating default workspace:", wsError)

  return { org, workspace }
}

/**
 * Fetch workspaces for an organization
 */
export async function getWorkspaces(organizationId: string) {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("organization_id", organizationId)

  if (error) throw error
  return data
}

/**
 * Invite user to organization by email
 */
export async function inviteUserToOrg(organizationId: string, email: string, role: "admin" | "member" | "guest") {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (existingUser) {
    // Direct add
    const { data, error } = await supabase
      .from("membership")
      .insert({
        organization_id: organizationId,
        user_id: (existingUser as any).id,
        role,
      } as any)
      .select()

    if (error) throw error
    return { status: "added", data }
  }

  // Create notification / pending invite record
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: organizationId, // system placeholder
      type: "workspace_invite",
      title: "Organization Invite",
      body: `You've been invited to join an organization (${email})`,
      data: { organizationId, email, role },
    } as any)

  if (error) throw error
  return { status: "invited", data }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(organizationId: string) {
  const { data, error } = await supabase
    .from("membership")
    .select(`
      id,
      role,
      joined_at,
      user:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq("organization_id", organizationId)

  if (error) throw error
  return data
}
