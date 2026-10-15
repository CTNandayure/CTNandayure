import { getAuthError } from '../utils/errorMessages'

export function useErrorHandler() {
  return (error: unknown, fallback?: string) => getAuthError(error, fallback)
}
