import type {
  ActivityPayload,
  ActivityRecord,
  ActivityStatus,
  AdminActivitiesParams,
  AdminActivityPayload,
  PublicActivitiesParams,
} from '../types/activity.types'
import { apiRequest, buildQuery } from './apiClient'

export const activitiesService = {
  // ── Public (no login) ──

  getPublic(params: PublicActivitiesParams = {}) {
    return apiRequest<ActivityRecord[]>(`/activities${buildQuery({ ...params })}`, { auth: false })
  },

  getPublicBySlug(slug: string) {
    return apiRequest<ActivityRecord>(`/activities/${encodeURIComponent(slug)}`, { auth: false })
  },

  // ── Owner: the logged-in business owner's own activities ──

  getMine() {
    return apiRequest<ActivityRecord[]>('/activities/my')
  },

  createMine(payload: ActivityPayload) {
    return apiRequest<ActivityRecord>('/activities/my', { method: 'POST', body: payload })
  },

  updateMine(id: string, payload: Partial<ActivityPayload>) {
    return apiRequest<ActivityRecord>(`/activities/my/${id}`, { method: 'PATCH', body: payload })
  },

  updateMineStatus(id: string, status: ActivityStatus) {
    return apiRequest<ActivityRecord>(`/activities/my/${id}/status`, { method: 'PATCH', body: { status } })
  },

  // ── Admin: every activity ──

  adminList(params: AdminActivitiesParams = {}) {
    return apiRequest<ActivityRecord[]>(`/activities/admin${buildQuery({ ...params })}`)
  },

  adminGet(id: string) {
    return apiRequest<ActivityRecord>(`/activities/admin/${id}`)
  },

  adminCreate(payload: AdminActivityPayload) {
    return apiRequest<ActivityRecord>('/activities/admin', { method: 'POST', body: payload })
  },

  adminUpdate(id: string, payload: Partial<ActivityPayload>) {
    return apiRequest<ActivityRecord>(`/activities/admin/${id}`, { method: 'PATCH', body: payload })
  },

  adminUpdateStatus(id: string, status: ActivityStatus) {
    return apiRequest<ActivityRecord>(`/activities/admin/${id}/status`, { method: 'PATCH', body: { status } })
  },
}
