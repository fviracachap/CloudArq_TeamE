import { apiClient } from "./client"
import type { StatusHistory } from "../types"

export async function getRequestHistory(
  requestId: string
): Promise<StatusHistory[]> {
  return apiClient<StatusHistory[]>(`/requests/${requestId}/history`)
}
