// Database types for TeamFlow
// Generated types based on the database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          owner_id: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKey: "owner_id",
            columns: ["owner_id"],
            reference: "users.id"
          }
        ]
      }
      workspaces: {
        Row: {
          id: string
          organization_id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          role: "owner" | "admin" | "member" | "guest"
          member_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          role?: "owner" | "admin" | "member" | "guest"
          member_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          role?: "owner" | "admin" | "member" | "guest"
          member_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKey: "organization_id",
            columns: ["organization_id"],
            reference: "organizations.id"
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: "owner" | "admin" | "member" | "guest"
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: "owner" | "admin" | "member" | "guest"
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: "owner" | "admin" | "member" | "guest"
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKey: "organization_id",
            columns: ["organization_id"],
            reference: "organizations.id"
          },
          {
            foreignKey: "user_id",
            columns: ["user_id"],
            reference: "users.id"
          }
        ]
      }
      channels: {
        Row: {
          id: string
          workspace_id: string
          name: string
          slug: string
          description: string | null
          type: "public" | "private" | "dm" | "group"
          is_archived: boolean
          member_count: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          slug: string
          description?: string | null
          type?: "public" | "private" | "dm" | "group"
          is_archived?: boolean
          member_count?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          slug?: string
          description?: string | null
          type?: "public" | "private" | "dm" | "group"
          is_archived?: boolean
          member_count?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKey: "workspace_id",
            columns: ["workspace_id"],
            reference: "workspaces.id"
          },
          {
            foreignKey: "created_by",
            columns: ["created_by"],
            reference: "users.id"
          }
        ]
      }
      channel_members: {
        Row: {
          id: string
          channel_id: string
          user_id: string
          role: "member" | "admin"
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          user_id: string
          role?: "member" | "admin"
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          user_id?: string
          role?: "member" | "admin"
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKey: "channel_id",
            columns: ["channel_id"],
            reference: "channels.id"
          },
          {
            foreignKey: "user_id",
            columns: ["user_id"],
            reference: "users.id"
          }
        ]
      }
      messages: {
        Row: {
          id: string
          channel_id: string
          author_id: string
          content: string
          type: "text" | "file" | "system"
          metadata: Json | null
          created_at: string
          updated_at: string
          edited_at: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          channel_id: string
          author_id: string
          content: string
          type?: "text" | "file" | "system"
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          edited_at?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          channel_id?: string
          author_id?: string
          content?: string
          type?: "text" | "file" | "system"
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          edited_at?: string | null
          is_deleted?: boolean
        }
        Relationships: [
          {
            foreignKey: "channel_id",
            columns: ["channel_id"],
            reference: "channels.id"
          },
          {
            foreignKey: "author_id",
            columns: ["author_id"],
            reference: "users.id"
          }
        ]
      }
      reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKey: "message_id",
            columns: ["message_id"],
            reference: "messages.id"
          },
          {
            foreignKey: "user_id",
            columns: ["user_id"],
            reference: "users.id"
          }
        ]
      }
      message_reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKey: "message_id",
            columns: ["message_id"],
            reference: "messages.id"
          },
          {
            foreignKey: "user_id",
            columns: ["user_id"],
            reference: "users.id"
          }
        ]
      }
      thread_replies: {
        Row: {
          id: string
          message_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
          edited_at: string | null
          is_deleted: boolean
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
          edited_at?: string | null
          is_deleted?: boolean
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          edited_at?: string | null
          is_deleted?: boolean
        }
        Relationships: [
          {
            foreignKey: "message_id",
            columns: ["message_id"],
            reference: "messages.id"
          },
          {
            foreignKey: "user_id",
            columns: ["user_id"],
            reference: "users.id"
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: "message" | "mention" | "reaction" | "channel_joined" | "workspace_invite"
          title: string
          body: string
          data: Json | null
          is_read: boolean
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: "message" | "mention" | "reaction" | "channel_joined" | "workspace_invite"
          title: string
          body: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: "message" | "mention" | "reaction" | "channel_joined" | "workspace_invite"
          title?: string
          body?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKey: "user_id",
            columns: ["user_id"],
            reference: "users.id"
          }
        ]
      }
      files: {
        Row: {
          id: string
          message_id: string
          storage_path: string
          file_name: string
          file_size: number
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          storage_path: string
          file_name: string
          file_size: number
          mime_type: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          storage_path?: string
          file_name?: string
          file_size?: number
          mime_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKey: "message_id",
            columns: ["message_id"],
            reference: "messages.id"
          }
        ]
      }
      integrations: {
        Row: {
          id: string
          workspace_id: string
          type: "slack" | "github" | "google_drive" | "zoom"
          name: string
          config: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          type: "slack" | "github" | "google_drive" | "zoom"
          name: string
          config: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          type?: "slack" | "github" | "google_drive" | "zoom"
          name?: string
          config?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKey: "workspace_id",
            columns: ["workspace_id"],
            reference: "workspaces.id"
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

// Helper types
export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"]
export type Channel = Database["public"]["Tables"]["channels"]["Row"]
export type Message = Database["public"]["Tables"]["messages"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Membership = Database["public"]["Tables"]["membership"]["Row"]
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"]
export type MessageReaction = Database["public"]["Tables"]["message_reactions"]["Row"]