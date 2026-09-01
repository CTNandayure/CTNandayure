import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto, UpdateUserStatusDto } from '../dtos';
import { UserEntity } from '../entities';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user with personal information
   * User starts in PENDIENTE_ACTIVACION status
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { name, first_lastname, phone, email } = createUserDto;

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
              second_lastname: 'Admin',  // Valor por defecto
              phone: phone.trim(),
            },
          },
        },
        include: {
          person: true,
        },
      });

      this.logger.debug(`User created: ${user.email}`);
      return new UserEntity(user);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
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
}