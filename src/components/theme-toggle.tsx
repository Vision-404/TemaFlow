"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <Button variant="ghost" size="sm" className="h-9 w-9" />
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
    setTheme(newTheme)
  }

  const themeIcon = theme === "system"
    ? (resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />)
    : theme === "light"
    ? <Sun className="h-4 w-4" />
    : <Moon className="h-4 w-4" />

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 w-9 justify-center"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {themeIcon}
    </Button>
  )
}