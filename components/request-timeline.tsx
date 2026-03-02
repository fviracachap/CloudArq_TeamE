import type { StatusHistory } from "@/lib/types"
import { StatusBadge } from "@/components/status-badge"
import { format } from "date-fns"

interface RequestTimelineProps {
  history: StatusHistory[]
}

export function RequestTimeline({ history }: RequestTimelineProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No status history available.
      </p>
    )
  }

  return (
    <div className="relative flex flex-col gap-0">
      {history.map((entry, index) => (
        <div key={entry.id} className="relative flex gap-4 pb-8 last:pb-0">
          {/* Vertical line */}
          {index < history.length - 1 && (
            <div className="absolute left-[11px] top-6 h-full w-px bg-border" />
          )}

          {/* Dot */}
          <div className="relative z-10 mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={entry.status} />
              <span className="text-xs text-muted-foreground">
                {format(new Date(entry.changedAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            {entry.notes && (
              <p className="text-sm text-muted-foreground">{entry.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Changed by: {entry.changedBy}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
