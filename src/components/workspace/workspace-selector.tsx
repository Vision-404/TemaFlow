"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"

interface Workspace {
  id: string
  name: string
  emoji: string
  memberCount: number
  role: "owner" | "admin" | "member" | "guest"
  isDefault?: boolean
}

interface WorkspaceSelectorProps {
  className?: string
  currentWorkspaceId?: string
}

export function WorkspaceSelector({
  className,
  currentWorkspaceId
}: WorkspaceSelectorProps) {
  const [open, setOpen] = useState(false)

  const workspaces: Workspace[] = [
    {
      id: "ws-1",
      name: "TeamFlow",
      emoji: "🚀",
      memberCount: 42,
      role: "owner",
      isDefault: true
    },
    {
      id: "ws-2",
      name: "Acme Corp",
      emoji: "🏢",
      memberCount: 128,
      role: "member"
    },
    {
      id: "ws-3",
      name: "Startup XYZ",
      emoji: "💡",
      memberCount: 15,
      role: "admin"
    },
  ]

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0]

  return (
    <div className={cn("hidden md:flex items-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-full bg-secondary px-3 hover:bg-secondary/80"
            aria-label="Select workspace"
          >
            <span className="text-lg">{currentWorkspace!.emoji}</span>
            <span className="font-medium text-sm">
              {currentWorkspace!.name}
            </span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder="Search workspaces..." />
            <CommandEmpty message="No workspaces found." />
            <CommandGroup>
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  onSelect={() => {
                    // Handle workspace switch
                    console.log("Switch to workspace:", workspace.id)
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{workspace.emoji}</span>
                      <span>{workspace.name}</span>
                    </div>
                    {workspace.isDefault && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  {currentWorkspace!.id === workspace.id && (
                    <Check className="h-4 w-4 text-primary ml-2" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem className="cursor-pointer justify-center">
                <Plus className="h-4 w-4 mr-2" />
                Create new workspace
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}