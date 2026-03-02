"use client"

import { useState } from "react"
import { useNotifications } from "@/lib/notification-context"
import type { Notification } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Bell,
  Loader2,
  AlertCircle,
  CheckCheck,
  Circle,
  Wifi,
  WifiOff,
} from "lucide-react"
import { format } from "date-fns"

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    wsStatus,
    markRead,
    markAllRead,
  } = useNotifications()
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL")

  const filtered =
    filter === "UNREAD"
      ? notifications.filter((n) => !n.read)
      : notifications

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}.`}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
            title={`WebSocket: ${wsStatus}`}
          >
            {wsStatus === "connected" ? (
              <Wifi className="h-3.5 w-3.5 text-primary" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-destructive" />
            )}
            {wsStatus === "connected" ? "Live" : "Offline"}
          </span>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Filter */}
      <div className="flex gap-1">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "UNREAD"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {notifications.length === 0
                ? "No notifications yet."
                : "No unread notifications."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.read ? "border-primary/20 bg-primary/5" : ""
              }`}
            >
              <CardContent className="flex items-start gap-3 py-4">
                <div className="mt-0.5">
                  {notification.read ? (
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Circle className="h-4 w-4 fill-primary text-primary" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <p
                    className={`text-sm ${
                      notification.read
                        ? "text-muted-foreground"
                        : "font-medium text-foreground"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(notification.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markRead(notification.id)}
                    className="text-xs"
                  >
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
