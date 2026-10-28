import { authService } from './authService'

export const userService = {
  getUserProfile: authService.getCurrentUser,
}
