"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createRequest } from "@/lib/api/requests"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const serviceNames: Record<string, string> = {
  "1": "Maintenance",
  "2": "Security",
  "3": "Cleaning",
  "4": "Common Areas",
  "5": "PQRs",
}

const requestSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
})

type RequestFormData = z.infer<typeof requestSchema>

export default function CreateRequestPage({
  params,
}: {
  params: Promise<{ typeId: string }>
}) {
  const { typeId } = use(params)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const serviceName = serviceNames[typeId] || `Service #${typeId}`

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      priority: "MEDIUM",
    },
  })

  async function onSubmit(data: RequestFormData) {
    setError(null)
    try {
      const result = await createRequest({
        serviceTypeId: typeId,
        description: data.description,
        priority: data.priority,
      })
      toast.success("Request submitted successfully!")
      router.push(`/requests/${result.id}`)
    } catch {
      setError("Failed to submit request. The backend may not be available.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Service Request"
        description={`Submitting a request for: ${serviceName}`}
      >
        <Button variant="ghost" asChild>
          <Link href="/services">
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
        </Button>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>
            Provide a clear description of your request so the administration
            can assist you efficiently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label>Service Type</Label>
              <Input value={serviceName} disabled />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                defaultValue="MEDIUM"
                onValueChange={(val) =>
                  setValue("priority", val as "LOW" | "MEDIUM" | "HIGH")
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={5}
                placeholder="Describe your request in detail..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/services">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
