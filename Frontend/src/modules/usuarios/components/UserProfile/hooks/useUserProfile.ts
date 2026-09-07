import { useAuth } from '../../../context/useAuth'

export function useUserProfile() {
  return useAuth()
}
