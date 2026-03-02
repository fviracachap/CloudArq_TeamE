import { apiClient } from "./client"
import type {
  ServiceRequest,
  ServiceType,
  CreateRequestPayload,
  UpdateRequestPayload,
} from "../types"

export async function getServiceTypes(): Promise<ServiceType[]> {
  return apiClient<ServiceType[]>("/service-types")
}

export async function createRequest(
  data: CreateRequestPayload
): Promise<ServiceRequest> {
  return apiClient<ServiceRequest>("/requests", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getRequest(id: string): Promise<ServiceRequest> {
  return apiClient<ServiceRequest>(`/requests/${id}`)
}

export async function getRequests(): Promise<ServiceRequest[]> {
  return apiClient<ServiceRequest[]>("/requests")
}

export async function updateRequest(
  id: string,
  data: UpdateRequestPayload
): Promise<ServiceRequest> {
  return apiClient<ServiceRequest>(`/requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteRequest(id: string): Promise<void> {
  return apiClient<void>(`/requests/${id}`, {
    method: "DELETE",
  })
}
