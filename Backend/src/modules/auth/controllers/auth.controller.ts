import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../services';
import {
  LoginDto,
  ActivateAccountDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dtos';
import { UserEntity } from '@/modules/user/entities';
import { JwtAuthGuard } from '../guards';
import { CurrentUser } from '../decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login endpoint
   * POST /auth/login
   */
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(loginDto);
  }

  /**
   * Activate account endpoint
   * POST /auth/activate
   */
  @Post('activate')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @HttpCode(HttpStatus.OK)
  async activateAccount(
    @Body() activateDto: ActivateAccountDto,
  ): Promise<UserEntity> {
    return this.authService.activateAccount(activateDto);
  }

  /**
   * Forgot password endpoint
   * POST /auth/forgot-password
   */
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(forgotPasswordDto);
    return {
      message:
        'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
    };
  }

  /**
   * Reset password endpoint
   * POST /auth/reset-password
   */
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<UserEntity> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Change password endpoint (authenticated)
   * POST /auth/change-password
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: UserEntity,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<UserEntity> {
    return this.authService.changePassword(user.id_person, changePasswordDto);
  }

  /**
   * Get current user endpoint (authenticated)
   * GET /auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return this.authService.getMe(user.id_person);
  }
}
