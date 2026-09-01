import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/modules/user/services';
import { MailService } from '@/modules/mail/services';
import {
  LoginDto,
  ActivateAccountDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dtos';
import { UserEntity } from '@/modules/user/entities';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private userService: UserService,
    private mailService: MailService,
  ) {}

  /**
   * User login - validate credentials and return JWT
   */
  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email doesn't exist
      throw new UnauthorizedException(
        'El email o contraseña no son válidos',
      );
    }

    // Check if user can login (must be ACTIVO)
    const canLogin = await this.userService.canLogin(user.id_person);
    if (!canLogin) {
      throw new UnauthorizedException(
        'La cuenta no está activa. Por favor, activa tu cuenta primero.',
      );
    }

    // Verify password
    const passwordHash = await this.userService.getPasswordHash(user.id_person);
    if (!passwordHash) {
      throw new UnauthorizedException(
        'El email o contraseña no son válidos',
      );
    }

    const isPasswordValid = await this.userService.verifyPassword(
      password,
      passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'El email o contraseña no son válidos',
      );
    }

    // Generate JWT
    const accessToken = this.generateJwt(user);

    this.logger.debug(`User logged in: ${user.email}`);
    return { accessToken };
  }

  /**
   * Create activation token for new users
   */
  async createActivationToken(userId: string): Promise<string> {
    const token = this.generateSecureToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.getTokenExpiration(
      this.configService.get<string>(
        'ACTIVATION_TOKEN_EXPIRES_IN',
        '24h',
      ),
    );

    try {
      await this.prisma.activationToken.create({
        data: {
          tokenHash,
          expiresAt,
          userId,
        },
      });

      this.logger.debug(`Activation token created for user ${userId}`);
      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error creating activation token: ${errorMessage}`,
      );
      throw new BadRequestException('Error creating activation token');
    }
  }

  /**
   * Activate account with token and set password
   */
  async activateAccount(activateDto: ActivateAccountDto): Promise<UserEntity> {
    const { token, password } = activateDto;

    // Validate password
    this.userService.validatePassword(password);

    // Find and validate token
    const tokenHash = this.hashToken(token);
    const activationToken = await this.prisma.activationToken.findUnique({
      where: { tokenHash },
    });

    if (!activationToken) {
      throw new BadRequestException('Token de activación inválido');
    }

    // Check expiration
    if (activationToken.expiresAt < new Date()) {
      throw new BadRequestException('El token de activación ha expirado');
    }

    // Check if token was already used
    if (activationToken.usedAt) {
      throw new BadRequestException(
        'El token de activación ya ha sido utilizado',
      );
    }

    // Set password and activate user
    await this.userService.setPasswordHash(activationToken.userId, password);
    const activatedUser = await this.userService.activateUser(
      activationToken.userId,
    );

    // Mark token as used
    await this.prisma.activationToken.update({
      where: { id: activationToken.id },
      data: { usedAt: new Date() },
    });

    this.logger.debug(`Account activated for user ${activationToken.userId}`);
    return activatedUser;
  }

  /**
   * Send password reset email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;

    // Check if user exists (but don't reveal it)
    const user = await this.userService.getUserByEmail(email);

    if (user) {
      try {
        // Create reset token
        const resetToken = await this.createPasswordResetToken(user.id_person);

        // Send email
        await this.mailService.sendPasswordResetEmail(email, resetToken);
        this.logger.debug(`Password reset email sent to ${email}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Error in forgot password for ${email}: ${errorMessage}`,
        );
        // Don't throw - maintain security by not revealing if email exists
      }
    }

    // Always return success to prevent user enumeration
    return;
  }

  /**
   * Create password reset token
   */
  private async createPasswordResetToken(userId: string): Promise<string> {
    const token = this.generateSecureToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.getTokenExpiration(
      this.configService.get<string>(
        'PASSWORD_RESET_TOKEN_EXPIRES_IN',
        '1h',
      ),
    );

    try {
      await this.prisma.passwordResetToken.create({
        data: {
          tokenHash,
          expiresAt,
          userId,
        },
      });

      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error creating password reset token: ${errorMessage}`,
      );
      throw new BadRequestException('Error creating password reset token');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<UserEntity> {
    const { token, password } = resetPasswordDto;

    // Validate password
    this.userService.validatePassword(password);

    // Find and validate token
    const tokenHash = this.hashToken(token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken) {
      throw new BadRequestException('Token de recuperación inválido');
    }

    // Check expiration
    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('El token de recuperación ha expirado');
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      throw new BadRequestException(
        'El token de recuperación ya ha sido utilizado',
      );
    }

    // Update password
    await this.userService.setPasswordHash(resetToken.userId, password);

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    const user = await this.userService.getUserById(resetToken.userId);

    this.logger.debug(`Password reset for user ${resetToken.userId}`);
    return user;
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserEntity> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Verify current password
    const passwordHash = await this.userService.getPasswordHash(userId);
    if (!passwordHash) {
      throw new BadRequestException('Usuario no tiene contraseña establecida');
    }

    const isCurrentPasswordValid = await this.userService.verifyPassword(
      currentPassword,
      passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Validate new password
    this.userService.validatePassword(newPassword);

    // Prevent using same password
    const isSamePassword = await this.userService.verifyPassword(
      newPassword,
      passwordHash,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'La nueva contraseña no puede ser igual a la actual',
      );
    }

    // Set new password
    await this.userService.setPasswordHash(userId, newPassword);

    const user = await this.userService.getUserById(userId);

    this.logger.debug(`Password changed for user ${userId}`);
    return user;
  }

  /**
   * Get current authenticated user
   */
  async getMe(userId: string): Promise<UserEntity> {
    return this.userService.getUserById(userId);
  }

  /**
   * Generate secure random token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash token for storage
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Parse expiration string and return Date
   * Supported formats: "1h", "24h", "7d", "30d"
   */
  private getTokenExpiration(expirationString: string): Date {
    const now = new Date();
    const match = expirationString.match(/^(\d+)([hd])$/);

    if (!match) {
      // Default to 24 hours
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 'h':
        return new Date(now.getTime() + numValue * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + numValue * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Generate JWT token
   */
  private generateJwt(user: UserEntity): string {
    const payload = {
      sub: user.id_person,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
