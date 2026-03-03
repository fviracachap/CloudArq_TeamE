"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import { login as loginApi } from "@/lib/api/auth"

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginAsDemo: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("comunidad360_token")
    const storedUser = localStorage.getItem("comunidad360_user")

    if (storedToken && storedUser) {
      try {
        const decoded = parseJwt(storedToken)
        if (decoded && decoded.exp) {
          const expDate = new Date((decoded.exp as number) * 1000)
          if (expDate > new Date()) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
          } else {
            localStorage.removeItem("comunidad360_token")
            localStorage.removeItem("comunidad360_user")
          }
        } else {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } catch {
        localStorage.removeItem("comunidad360_token")
        localStorage.removeItem("comunidad360_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginApi({ email, password })
      localStorage.setItem("comunidad360_token", response.token)
      localStorage.setItem("comunidad360_user", JSON.stringify(response.user))
      setToken(response.token)
      setUser(response.user)
      router.push("/")
    },
    [router]
  )

  const loginAsDemo = useCallback(async () => {
    try {
      // Use the real seeded demo account so the backend receives a valid JWT and numeric user ID
      const response = await loginApi({
        email: "resident@comunidad360.com",
        password: "password123",
      })
      localStorage.setItem("comunidad360_token", response.token)
      localStorage.setItem("comunidad360_user", JSON.stringify(response.user))
      setToken(response.token)
      setUser(response.user)
    } catch {
      // Fallback: offline demo mode (no API calls will work)
      const demoUser: User = {
        id: 1,
        name: "Demo Resident",
        email: "resident@comunidad360.com",
        role: "RESIDENT",
      }
      localStorage.setItem("comunidad360_token", "offline")
      localStorage.setItem("comunidad360_user", JSON.stringify(demoUser))
      setToken("offline")
      setUser(demoUser)
    }
    router.push("/")
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem("comunidad360_token")
    localStorage.removeItem("comunidad360_user")
    setToken(null)
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
