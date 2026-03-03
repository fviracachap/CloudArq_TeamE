"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getRequests } from "@/lib/api/requests"
import type { ServiceRequest, RequestStatus } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  Wrench,
} from "lucide-react"
import { format } from "date-fns"

interface StatCard {
  title: string
  value: number
  icon: React.ReactNode
  description: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await getRequests()
        setRequests(data)
      } catch {
        setError("Unable to load requests. The backend may not be available.")
      } finally {
        setIsLoading(false)
      }
    }
    loadRequests()
  }, [])

  function countByStatus(status: RequestStatus) {
    return requests.filter((r) => r.status === status).length
  }

  const stats: StatCard[] = [
    {
      title: "Total Requests",
      value: requests.length,
      icon: <ClipboardList className="h-5 w-5 text-primary" />,
      description: "All your requests",
    },
    {
      title: "Pending",
      value: countByStatus("CREATED") + countByStatus("ASSIGNED"),
      icon: <Clock className="h-5 w-5 text-amber-400" />,
      description: "Awaiting action",
    },
    {
      title: "In Progress",
      value: countByStatus("IN_PROGRESS"),
      icon: <Wrench className="h-5 w-5 text-blue-400" />,
      description: "Being worked on",
    },
    {
      title: "Resolved",
      value: countByStatus("RESOLVED") + countByStatus("CLOSED"),
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      description: "Completed",
    },
  ]

  const recentRequests = [...requests]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${user?.name || "Resident"}`}
        description="Here is an overview of your community service requests."
      >
        <Button asChild>
          <Link href="/services">
            <Plus className="h-4 w-4" />
            New Request
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{stat.title}</CardDescription>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? "-" : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Your latest service requests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/requests">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No requests yet. Create your first service request.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-2">
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/requests/${req.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">
                      {req.serviceType?.name ?? "Service Request"}
                    </span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {req.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={req.status} />
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {format(new Date(req.createdAt), "MMM d")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
