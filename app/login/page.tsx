"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrafficCone as Traffic } from "lucide-react"
import { isAuthenticated, saveAuthToken } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("admin123")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({})

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/")
    }
  }, [router])

  const validateInputs = () => {
    const errors: { username?: string; password?: string } = {}

    if (!username.trim()) {
      errors.username = "Username is required"
    }

    if (!password.trim()) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs first
    if (!validateInputs()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const body = new URLSearchParams()
      body.set("grant_type", "password")
      body.set("username", username.trim())
      body.set("password", password)
      body.set("scope", "")

      const clientId = process.env.NEXT_PUBLIC_LOGIN_CLIENT_ID
      const clientSecret = process.env.NEXT_PUBLIC_LOGIN_CLIENT_SECRET

      if (clientId) {
        body.set("client_id", clientId)
      }

      if (clientSecret) {
        body.set("client_secret", clientSecret)
      }

      const response = await fetch("https://judgingly-cicatrisant-milly.ngrok-free.dev/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      })

      if (!response.ok) {
        const errorText = await response.text()
        setError(errorText || `Login failed (${response.status})`)
        return
      }

      const data = await response.json()
      
      // Store the access token in localStorage
      saveAuthToken(data.access_token, data.token_type)
      
      // Redirect to dashboard
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-lg bg-accent/20 border border-accent/50">
                <Traffic className="w-8 h-8 text-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Smart Traffic Management</CardTitle>
            <CardDescription>Sign in to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-white">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`bg-white/5 text-white placeholder:text-white/50 ${
                    validationErrors.username ? "border-red-500/50 border-2" : "border-white/10"
                  }`}
                  required
                  disabled={isLoading}
                />
                {validationErrors.username && (
                  <p className="text-red-400 text-sm">{validationErrors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-white/5 text-white placeholder:text-white/50 ${
                    validationErrors.password ? "border-red-500/50 border-2" : "border-white/10"
                  }`}
                  required
                  disabled={isLoading}
                />
                {validationErrors.password && (
                  <p className="text-red-400 text-sm">{validationErrors.password}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
