"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react"
import { useAuth } from "@/lib/auth-context"
import { useWebSocket } from "@/hooks/use-websocket"
import {
  getNotifications,
  markNotificationRead,
} from "@/lib/api/notifications"
import type { Notification } from "@/lib/types"
import { toast } from "sonner"

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8000"

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  wsStatus: string
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const wsUrl = useMemo(() => {
    if (!user?.id || !token) return null
    return `${WS_BASE_URL}/ws/notifications?userId=${user.id}&token=${token}`
  }, [user?.id, token])

  const handleWsMessage = useCallback((data: unknown) => {
    const message = data as { type?: string; payload?: Notification }
    if (message?.type === "NOTIFICATION" && message.payload) {
      setNotifications((prev) => [message.payload!, ...prev])
      toast.info(message.payload.message, {
        description: "New notification",
      })
    }
  }, [])

  const { status: wsStatus } = useWebSocket({
    url: wsUrl,
    onMessage: handleWsMessage,
    reconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 15,
  })

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      setError(null)
      const data = await getNotifications(user.id)
      setNotifications(data)
    } catch {
      setError("Unable to load notifications. The backend may not be available.")
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const markRead = useCallback(async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch {
      toast.error("Failed to mark notification as read.")
    }
  }, [])

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read)
    try {
      await Promise.all(unread.map((n) => markNotificationRead(n.id)))
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success("All notifications marked as read.")
    } catch {
      toast.error("Failed to mark all as read.")
    }
  }, [notifications])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      wsStatus,
      markRead,
      markAllRead,
      refresh: loadNotifications,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      wsStatus,
      markRead,
      markAllRead,
      loadNotifications,
    ]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    )
  }
  return ctx
}
