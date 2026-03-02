import type { RequestStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  CREATED: {
    label: "Created",
    className: "bg-muted text-muted-foreground border-border",
  },
  ASSIGNED: {
    label: "Assigned",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-muted text-muted-foreground border-border",
  },
}

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.CREATED
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
