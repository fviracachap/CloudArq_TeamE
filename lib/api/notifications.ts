import { apiClient } from "./client"
import type { Notification } from "../types"

export async function getNotifications(
  userId: string
): Promise<Notification[]> {
  return apiClient<Notification[]>(`/notifications/${userId}`)
}

export async function markNotificationRead(
  id: string
): Promise<Notification> {
  return apiClient<Notification>(`/notifications/${id}/read`, {
    method: "PUT",
  })
}
