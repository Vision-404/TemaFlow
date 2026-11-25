export type Theme = "light" | "dark" | "system"

export interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme
  storageKey?: string
}

export interface ThemeState {
  theme: Theme
  resolvedTheme: "light" | "dark"
}

export type ThemeColor = {
  [key: string]: string
}

export interface TeamFlowTheme {
  colors: {
    primary: string
    secondary: string
    background: string
    foreground: string
    muted: string
    accent: string
    border: string
    ring: string
    card: string
    popover: string
    destructive: string
  }
  fonts: {
    sans: string
    mono: string
  }
  spacing: string[]
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}