"use client"

import * as React from "react"

export type ToastProps = {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

const STORAGE_KEY = "teamflow-toast"

export function useToast() {
  const [state, setState] = React.useState<{
    toasts: ToastProps[]
  }>({ toasts: [] })

  // Load toasts from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setState({ toasts: JSON.parse(stored) })
      }
    } catch (e) {
      console.error("Failed to load toasts from localStorage:", e)
    }
  }, [])

  // Save toasts to localStorage
  React.useEffect(() => {
    if (state.toasts.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.toasts))
      } catch (e) {
        console.error("Failed to save toasts to localStorage:", e)
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        console.error("Failed to remove toasts from localStorage:", e)
      }
    }
  }, [state.toasts])

  const toast = React.useCallback(
    ({
      title,
      description,
      action,
      ...props
    }: Omit<ToastProps, "id">) => {
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)

      setState((prev) => ({
        toasts: [...prev.toasts, { id, title, description, action, ...props }],
      }))

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setState((prev) => ({
          toasts: prev.toasts.filter((t) => t.id !== id),
        }))
      }, 5000)

      return id
    },
    []
  )

  const dismiss = React.useCallback((id: string) => {
    setState((prev) => ({
      toasts: prev.toasts.filter((t) => t.id !== id),
    }))
  }, [])

  return {
    ...state,
    toast,
    dismiss,
  }
}