"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  actionLabel?: string
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group relative flex w-full items-center justify-between space-x-4 rounded-md border p-4 pr-8 shadow-lg",
        "data-[swipe=direction]_left:translate-x-[var(--radix-toast-state-sliding-direction)]",
        "data-[swipe=done]:translate-x-0 data-[swipe=left]:slide-in-to-left-0",
        "data-[swipe=right]:slide-in-to-right-0 data-[swipe=up]:slide-in-to-bottom-0",
        "data-[swipe=down]:slide-in-to-top-0",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[swipe=end]:slide-out-to-[var(--radix-toast-state-sliding-direction)]",
        "data-[state=removed]:slide-out-to-[var(--radix-toast-state-sliding-direction)]",
        "bg-popover text-popover-foreground border shadow-lg",
        "sm:pointer-events-auto",
        className
      )}
      {...props}
    >
      {children}
      <button
        className="absolute right-2 top-2 p-1 opacity-70 hover:opacity-100 transition-opacity"
        onClick={() => {
          const parent = (props as any).parent
          if (parent) parent.dismiss()
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
  )
)
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
  )
)
ToastDescription.displayName = "ToastDescription"

const ToastAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium",
        "transition-colors hover:bg-secondary hover:text-secondary-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
ToastAction.displayName = "ToastAction"

const ToastClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute right-2 top-2 p-1 opacity-70 hover:opacity-100 transition-opacity",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  )
)
ToastClose.displayName = "ToastClose"

const ToastProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)

const ToastViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-0 right-0 z-50 flex w-full flex-col gap-4 p-4",
        "max-w-sm",
        className
      )}
      {...props}
    />
  )
)
ToastViewport.displayName = "ToastViewport"

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
}