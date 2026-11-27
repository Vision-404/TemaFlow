"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/auth"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await signIn(email, password)
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-background px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 pt-8 pb-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-2xl">TF</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign in to your TeamFlow account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                aria-label="Forgot password"
              >
                Forgot password?
              </Link>
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
            <Button
            type="submit"
            className="w-full py-3 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-all"
            disabled={isLoading}
          >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4 pt-4 pb-8 border-t-0">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
          <div className="flex items-center justify-center space-y-4">
            <div className="w-full flex items-center relative">
              <div className="flex-grow border-t border-border" />
              <span className="px-2 text-xs text-muted-foreground uppercase tracking-wider">
                Or continue with
              </span>
              <div className="flex-grow border-t border-border" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="w-10 h-10 p-0" aria-label="Sign in with Google">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66v-2.77c-1.16-.79-1.95-1.94-2.21-3.31H12v-4.26H5.92c.26 1.37 1.04 2.53 2.21 3.31V23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.92 14.37v-2.77c1.16-.79 1.95-1.94 2.21-3.31H12v4.26c-1.97 1.2-4.34 2.12-6.08 1.82"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.74 0 3.41.62 4.7 1.74v2.77c-1.16-.79-1.95-1.94-2.21-3.31H12z"
                  />
                </svg>
              </Button>
              <Button variant="outline" className="w-10 h-10 p-0" aria-label="Sign in with GitHub">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C-0.62-2.16-1.88-3.52-1.88-3.52C-0.36-2.41.78-.24.78-.24C1.04.78 1.64 1.04 1.64 1.04C2.36 2.14 4.01 1.84 4.01 1.84C5.23 1.43 7.16 1.58 7.16 1.58C8.34 1.51 9.65 2.09 9.65 2.09C11.63 2.22 12.88 2.49 12.88 2.49C14.91 2.73 16.4 3.42 16.4 3.42C17.23 4.3 17.91 5.54 17.91 5.54C18.68 5.77 19.52 6.17 19.52 6.17C20.7 6.17 21.61 6.88 21.61 6.88C22.55 7.78 23 8.38 23 8.38C23 8.38 23 9.7 21.38 10.7C19.69 11.26 18.54 11.13 18.54 11.13C17.16 11.46 17.16 11.46 16.28 11.68C15.11 11.91 14.23 12.36 14.23 12.36C13.52 12.82 13.52 12.82 13.52 12.82C12.77 12.87 12 12.87 12 12.87C12 12.87 11.23 12.87 10.48 12.83C9.87 12.83 9.29 12.51 9.29 12.51C8.41 12.51 7.69 13.41 7.69 13.41C7.69 13.41 6.73 13.83 6.73 13.83C7.44 14.27 8.21 14.89 9.06 15.28C7.65 15.95 6.63 16.99 6.63 18.3C6.63 19.78 7.61 21 9.06 21.03C9.44 21.08 9.84 21.09 10.22 21.08C11.77 21.02 13.17 20.69 13.17 20.69C14.13 20.44 14.75 20.3 14.75 20.3C15.55 20.46 16.51 21.23 16.51 21.23C17.77 21.09 18.55 20.39 18.55 20.39C20.28 19.44 21.23 17.39 21.23 15.3C21.23 11.88 18.57 7.6 12 7.6z" />
                </svg>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
