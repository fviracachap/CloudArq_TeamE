"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getRequest, deleteRequest } from "@/lib/api/requests"
import { getRequestHistory } from "@/lib/api/workflows"
import type { ServiceRequest, StatusHistory } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { RequestTimeline } from "@/components/request-timeline"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trash2,
  Calendar,
  Tag,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [request, setRequest] = useState<ServiceRequest | null>(null)
  const [history, setHistory] = useState<StatusHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [reqData, histData] = await Promise.allSettled([
          getRequest(id),
          getRequestHistory(id),
        ])
        if (reqData.status === "fulfilled") {
          setRequest(reqData.value)
        } else {
          setError("Unable to load request details.")
        }
        if (histData.status === "fulfilled") {
          setHistory(histData.value)
        }
      } catch {
        setError("Unable to load request details.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteRequest(id)
      toast.success("Request deleted successfully.")
      router.push("/requests")
    } catch {
      toast.error("Failed to delete request.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Request Detail">
          <Button variant="ghost" asChild>
            <Link href="/requests">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </PageHeader>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {error || "Request not found."}
            </p>
            <Button variant="outline" size="sm" asChild className="mt-2">
              <Link href="/requests">Back to Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Request #${request.id}`}
        description={request.serviceType?.name}
      >
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/requests">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this request? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Tag className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={request.status} className="mt-1" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Service Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {request.serviceType?.name ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm text-foreground">
                    {format(
                      new Date(request.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm text-foreground">
                    {format(
                      new Date(request.updatedAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
              </div>
            </div>
            {request.priority && (
              <div>
                <p className="text-xs text-muted-foreground">Priority</p>
                <p className="text-sm font-medium text-foreground">
                  {request.priority}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                {request.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
            <CardDescription>
              Track the progress of your request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RequestTimeline history={history} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
