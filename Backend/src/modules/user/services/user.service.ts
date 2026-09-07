import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/modules/mail/services';
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto } from '../dtos';
import { Role } from '@/generated/prisma/enums';
import { UserEntity } from '../entities';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new user with personal information
   * User starts in PENDIENTE_ACTIVACION status and activation email is sent
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const {
      name,
      first_lastname,
      second_lastname,
      phone,
      email,
      role,
    } = createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya se encuentra registrado');
    }

    try {
      // Create Person and User in a transaction
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: '', // Will be set during activation
          person: {
            create: {
              name: name.trim(),
              first_lastname: first_lastname.trim(),
              second_lastname: second_lastname.trim(),
              phone: phone.trim(),
            },
          },
          role: role ?? Role.NEGOCIO,
        },
        include: {
          person: true,
        },
      });

      this.logger.debug(`User created: ${user.email}`);

      // Generate activation token and send email
      const token = this.generateSecureToken();
      const tokenHash = this.hashToken(token);
      const expiresAt = this.getTokenExpiration(
        this.configService.get<string>('ACTIVATION_TOKEN_EXPIRES_IN', '24h'),
      );

      await this.prisma.activationToken.create({
        data: {
          tokenHash,
          expiresAt,
          userId: user.id_person,
        },
      });

      // Send activation email with the plain token
      await this.mailService.sendActivationEmail(user.email, token);

      this.logger.debug(`Activation email sent to ${user.email}`);
      return new UserEntity(user);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error creating user: ${err.message}`);
      throw new BadRequestException('Error al crear el usuario');
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      include: {
        person: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return users.map((user) => new UserEntity(user));
  }

  /**
   * Get user by ID
   */
  async getUserById(id_person: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id_person },
      include: {
        person: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return new UserEntity(user);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        person: true,
      },
    });

    if (!user) {
      return null;
    }

    return new UserEntity(user);
  }

  /**
   * Update user details and role/status for admin management.
   * Email is intentionally not editable.
   */
  async updateUser(
    id_person: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const existingUser = await this.getUserById(id_person);

    const dataToUpdate: Record<string, any> = {};
    const personData: Record<string, string> = {};

    if (updateUserDto.name !== undefined) {
      personData.name = updateUserDto.name.trim();
    }
    if (updateUserDto.first_lastname !== undefined) {
      personData.first_lastname = updateUserDto.first_lastname.trim();
    }
    if (updateUserDto.second_lastname !== undefined) {
      personData.second_lastname = updateUserDto.second_lastname.trim();
    }
    if (updateUserDto.phone !== undefined) {
      personData.phone = updateUserDto.phone.trim();
    }
    if (updateUserDto.role !== undefined) {
      dataToUpdate.role = updateUserDto.role;
    }
    if (updateUserDto.status !== undefined) {
      dataToUpdate.status = updateUserDto.status;
    }

    if (Object.keys(personData).length > 0) {
      dataToUpdate.person = {
        update: personData,
      };
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return existingUser;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id_person },
      data: dataToUpdate,
      include: {
        person: true,
      },
    });

    this.logger.debug(`User ${id_person} updated by admin`);
    return new UserEntity(updatedUser);
  }

  /**
   * Update user status (ACTIVO, INACTIVO, etc.)
   */
  async updateUserStatus(
    id_person: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<UserEntity> {
    const user = await this.getUserById(id_person); // Verify user exists

    const updatedUser = await this.prisma.user.update({
      where: { id_person },
      data: {
        status: updateUserStatusDto.status,
      },
      include: {
        person: true,
      },
    });

    this.logger.debug(`User ${id_person} status updated to ${updateUserStatusDto.status}`);
    return new UserEntity(updatedUser);
  }

  /**
   * Set password hash for a user (internal use only)
   */
  async setPasswordHash(userId: string, password: string): Promise<void> {
    this.validatePassword(password);

    const passwordHash = await argon2.hash(password);

    await this.prisma.user.update({
      where: { id_person: userId },
      data: { passwordHash },
    });

    this.logger.debug(`Password set for user ${userId}`);
  }

  /**
   * Validate password policy
   */
  validatePassword(password: string): void {
    if (password.length < 12) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 12 caracteres',
      );
    }

    if (password.length > 128) {
      throw new BadRequestException(
        'La contraseña no debe exceder 128 caracteres',
      );
    }

    // Check for common weak passwords (simplified check)
    const commonPasswords = [
      'password',
      '12345678',
      'qwerty',
      'admin',
      'letmein',
      'welcome',
      'monkey',
    ];

    const lowerPassword = password.toLowerCase();
    if (commonPasswords.some((weak) => lowerPassword.includes(weak))) {
      throw new BadRequestException(
        'La contraseña es demasiado común o predecible',
      );
    }
  }

  /**
   * Activate user account (set status to ACTIVO)
   */
  async activateUser(userId: string): Promise<UserEntity> {
    const updatedUser = await this.prisma.user.update({
      where: { id_person: userId },
      data: { status: 'ACTIVO' },
      include: {
        person: true,
      },
    });

    this.logger.debug(`User activated: ${updatedUser.email}`);
    return new UserEntity(updatedUser);
  }

  /**
   * Get password hash for verification (internal use only)
   */
  async getPasswordHash(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id_person: userId },
      select: { passwordHash: true },
    });

    return user?.passwordHash || null;
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Password verification error: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Check if user can login (ACTIVO status)
   */
  async canLogin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id_person: userId },
      select: { status: true },
    });

    return user?.status === 'ACTIVO';
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
}