"use client"

import { useState } from "react"
import { Search, Settings, Menu, Users, Filter, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { useUser } from "@/hooks/use-user"

interface HeaderProps {
  className?: string
  onMenuClick?: () => void
}

export function Header({ className, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useUser()

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between px-4 border-b border-border bg-background",
        "px-6 md:px-4",
        className
      )}
    >
      {/* Left Side - Menu and Workspace */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Workspace Switcher */}
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-full bg-secondary px-3"
          >
            <Users className="h-4 w-4" />
            <span className="font-medium">TeamFlow Workspace</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages, files, or channels..."
            className="pl-10 pr-4 bg-secondary text-foreground border-none focus:ring-0 focus:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center space-x-2">
        {/* New Channel Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          aria-label="New channel"
        >
          <Filter className="h-5 w-5" />
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        {user && <NotificationCenter currentUserId={user.id} />}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full"
              aria-label="Open user menu"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar_url || "/avatars/user-1.jpg"} alt={user?.full_name || "User"} />
                <AvatarFallback>
                  {user?.full_name?.[0] ?? (user?.email?.[0]?.toUpperCase() ?? "U")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}