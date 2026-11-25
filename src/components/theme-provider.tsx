"use client"

import * as React from "react"
import { Theme, ThemeProviderProps } from "@/types/theme"

// Context for theme state
const ThemeProviderContext = React.createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}>({
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
})

// Theme provider component
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "teamflow-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    // Try to get from localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey)
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored
      }
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light")

  // Determine the resolved theme based on system preference or user preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const updateResolvedTheme = () => {
      if (theme === "system") {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light")
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()
    mediaQuery.addEventListener("change", updateResolvedTheme)

    return () => mediaQuery.removeEventListener("change", updateResolvedTheme)
  }, [theme])

  // Apply theme to document element
  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (resolvedTheme === "dark") {
      root.classList.add("dark")
      root.setAttribute("data-theme", "dark")
    } else {
      root.classList.add("light")
      root.setAttribute("data-theme", "light")
    }
  }, [resolvedTheme])

  // Handle storage in localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, theme)
    }
  }, [theme, storageKey])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, resolvedTheme]
  )

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

// Hook to use theme
export function useTheme() {
  const context = React.useContext(ThemeProviderContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}