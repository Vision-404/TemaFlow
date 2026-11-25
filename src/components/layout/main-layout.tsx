"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ChannelList } from "@/components/channels/channel-list"
import { WorkspaceSelector } from "@/components/workspace/workspace-selector"

export function MainLayout({
  className,
  children
}: {
  className?: string
  children?: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className={cn("flex h-screen bg-background text-foreground", className)}>
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <Sidebar className="h-full" />
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        {/* Workspace Selector - Desktop */}
        <WorkspaceSelector className="px-4 py-2 md:hidden" />

        {/* Chat Content Area */}
        <div className="flex-1 flex">
          {/* Channel List - Desktop */}
          <div className="hidden lg:block w-64 border-r border-border bg-card bg-card/50">
            <ChannelList />
          </div>

          {/* Message Area - Renders children when provided, or shows default */}
          <div className="flex-1 flex flex-col">
            {children || (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <h2 className="text-2xl font-bold mb-4">Welcome to TeamFlow</h2>
                  <p className="text-muted-foreground mb-6">
                    Your collaboration workspace is ready. Select a channel from the sidebar to start messaging.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}