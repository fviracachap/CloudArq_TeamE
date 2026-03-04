"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getRequests } from "@/lib/api/requests"
import type { ServiceRequest, RequestStatus } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Plus,
  Loader2,
  AlertCircle,
  ClipboardList,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

const statusTabs: { label: string; value: RequestStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Created", value: "CREATED" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
]

export default function RequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<RequestStatus | "ALL">("ALL")
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await getRequests(user?.id)
        setRequests(data)
      } catch {
        setError("Unable to load requests. The backend may not be available.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user])

  const filtered = requests
    .filter((r) => activeTab === "ALL" || r.status === activeTab)
    .filter(
      (r) =>
        search === "" ||
        (r.serviceType?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.description ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Requests"
        description="View and manage your service requests."
      >
        <Button asChild>
          <Link href="/services">
            <Plus className="h-4 w-4" />
            New Request
          </Link>
        </Button>
      </PageHeader>

      {/* Filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request list */}
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
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {requests.length === 0
                ? "No requests found. Create your first service request."
                : "No requests match your filters."}
            </p>
            {requests.length === 0 && (
              <Button variant="outline" size="sm" asChild className="mt-2">
                <Link href="/services">Browse Services</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req) => (
            <Link
              key={req.id}
              href={`/requests/${req.id}`}
              className="group"
            >
              <Card className="transition-colors group-hover:border-primary/30">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {req.serviceType?.name ?? "Service Request"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        #{req.id}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {req.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={req.status} />
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {format(new Date(req.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
