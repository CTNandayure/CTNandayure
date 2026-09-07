export function getAuthError(error: unknown, fallback = 'No fue posible completar la operación') {
  if (error instanceof Error && error.message) return error.message
  return fallback
}
