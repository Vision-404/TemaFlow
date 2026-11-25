"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Keyboard } from "lucide-react"

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    filter?: (term: string, search: string) => number
  }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
Command.displayName = "Command"

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
))
CommandInput.displayName = "CommandInput"

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { message: string }
>(({ className, message, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "py-6 px-4 text-sm text-muted-foreground",
      className
    )}
    {...props}
  >
    {message || "No results found."}
  </div>
))
CommandEmpty.displayName = "CommandEmpty"

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col",
      className
    )}
    {...props}
  />
))
CommandGroup.displayName = "CommandGroup"

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "max-h-[300px] overflow-y-auto overflow-x-hidden",
      className
    )}
    {...props}
  />
))
CommandList.displayName = "CommandList"

const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    shortcut?: readonly string[]
  }
>(({ className, shortcut, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {props.children}
    {shortcut && (
      <Keyboard className="ml-auto h-4 w-4 opacity-60" />
    )}
  </div>
))
CommandItem.displayName = "CommandItem"

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "-mx-2 h-px bg-border",
      className
    )}
    {...props}
  />
))
CommandSeparator.displayName = "CommandSeparator"

export {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem,
  CommandSeparator,
}