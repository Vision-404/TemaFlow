"use client"

"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Home,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  LogOut,
} from "lucide-react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  isActive?: boolean
  isNew?: boolean
  isBadge?: boolean
  isActiveGroup?: boolean
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const mainNavItems: NavItem[] = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Channels", href: "/channels", icon: MessageSquare },
    { name: "Direct Messages", href: "/dm", icon: MessageSquare },
    { name: "Members", href: "/members", icon: Users },
  ]

  const adminNavItems: NavItem[] = [
    { name: "Admin", href: "/admin", icon: Shield },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Workspace Settings", href: "/workspace-settings", icon: Settings },
  ]

  const bottomNavItems: NavItem[] = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Logout", href: "/logout", icon: LogOut },
  ]

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  const renderNavItem = (item: NavItem) => (
    <TooltipProvider key={item.name}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200",
              "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              item.isActive && "bg-accent text-accent-foreground",
              isCollapsed && "justify-center"
            )}
            aria-current={item.isActive ? "page" : undefined}
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            {!isCollapsed && (
              <span className="ml-3">{item.name}</span>
            )}
            {item.isNew && !isCollapsed && (
              <span className="ml-auto text-xs bg-primary-200 text-primary-800 px-1.5 py-0.5 rounded-full">
                NEW
              </span>
            )}
          </a>
        </TooltipTrigger>
        {isCollapsed ? (
          <TooltipContent side="right" className="whitespace-nowrap">
            {item.name}
          </TooltipContent>
        ) : undefined}
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen w-[calc(250px_+_1px)] bg-sidebar-background border-r border-border",
        isCollapsed && "w-[60px] min-w-[60px]",
        className
      )}
    >
      {/* Header with workspace logo */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm" aria-label="TeamFlow logo">TF</span>
          </div>
          {!isCollapsed && <span className="font-semibold text-lg">TeamFlow</span>}
        </div>
        <button
          onClick={toggleCollapse}
          className="p-1 rounded-full hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Workspace Selector */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-b border-border">
          <select
            className="w-full text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Select workspace"
          >
            <option value="default">TeamFlow Workspace</option>
          </select>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1" aria-label="Main navigation">
        {mainNavItems.map(renderNavItem)}
      </nav>

      {/* Admin Section (conditional) */}
      <nav className="px-2 py-4 space-y-1 border-t border-border" aria-label="Admin navigation">
        {adminNavItems.map(renderNavItem)}
      </nav>

      {/* Bottom Navigation */}
      <nav className="px-2 py-4 space-y-1 border-t border-border" aria-label="User navigation">
        {bottomNavItems.map(renderNavItem)}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border">
        <ThemeToggle />
      </div>
    </aside>
  )
}