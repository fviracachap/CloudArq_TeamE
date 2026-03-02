"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getServiceTypes } from "@/lib/api/requests"
import type { ServiceType } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Wrench,
  Shield,
  Sparkles,
  Trees,
  FileText,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  maintenance: <Wrench className="h-6 w-6" />,
  security: <Shield className="h-6 w-6" />,
  cleaning: <Sparkles className="h-6 w-6" />,
  common_areas: <Trees className="h-6 w-6" />,
  pqrs: <FileText className="h-6 w-6" />,
}

function getIcon(name: string, icon?: string) {
  if (icon && iconMap[icon]) return iconMap[icon]
  const lowerName = name.toLowerCase()
  if (lowerName.includes("maintenance") || lowerName.includes("mantenimiento"))
    return iconMap.maintenance
  if (lowerName.includes("security") || lowerName.includes("seguridad"))
    return iconMap.security
  if (lowerName.includes("clean") || lowerName.includes("aseo"))
    return iconMap.cleaning
  if (
    lowerName.includes("common") ||
    lowerName.includes("zona") ||
    lowerName.includes("area")
  )
    return iconMap.common_areas
  if (lowerName.includes("pqr")) return iconMap.pqrs
  return <FileText className="h-6 w-6" />
}

// Fallback service types when the backend is unavailable
const fallbackServiceTypes: ServiceType[] = [
  {
    id: "1",
    name: "Maintenance",
    description:
      "Report maintenance issues such as plumbing, electrical, or structural problems in your unit or common areas.",
    icon: "maintenance",
  },
  {
    id: "2",
    name: "Security",
    description:
      "Report security concerns, request access changes, or flag suspicious activity in the community.",
    icon: "security",
  },
  {
    id: "3",
    name: "Cleaning",
    description:
      "Request cleaning services for common areas or report hygiene concerns within the community.",
    icon: "cleaning",
  },
  {
    id: "4",
    name: "Common Areas",
    description:
      "Request reservations or report issues related to shared spaces such as pools, gyms, and meeting rooms.",
    icon: "common_areas",
  },
  {
    id: "5",
    name: "PQRs",
    description:
      "Submit petitions, complaints, or claims related to community management and administration.",
    icon: "pqrs",
  },
]

export default function ServicesPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getServiceTypes()
        setServiceTypes(data)
      } catch {
        setServiceTypes(fallbackServiceTypes)
        setUsingFallback(true)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Service Catalog"
        description="Browse available services and submit a request."
      />

      {usingFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Showing default service types. Backend is not connected.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceTypes.map((service) => (
            <Card
              key={service.id}
              className="flex flex-col transition-colors hover:border-primary/30"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {getIcon(service.name, service.icon)}
                  </div>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                </div>
                <CardDescription className="mt-2 line-clamp-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/services/${service.id}/request`}>
                    Request Service
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
