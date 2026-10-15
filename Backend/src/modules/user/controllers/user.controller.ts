import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../services';
import { UpdateUserDto, UpdateUserStatusDto } from '../dtos';
import { UserEntity } from '../entities';
import { CreateUserDto } from '../dtos';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { RolesGuard } from '@/modules/auth/guards';
import { Roles } from '@/modules/auth/decorators';
import { Role } from '@/generated/prisma/enums';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get all users (ADMIN only)
   */
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAllUsers(): Promise<UserEntity[]> {
    return this.userService.getAllUsers();
  }

  /**
   * Get user by ID (ADMIN only)
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getUserById(@Param('id') id: string): Promise<UserEntity> {
    return this.userService.getUserById(id);
  }

  /**
   * Create a new user (ADMIN only)
   */
  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.createUser(createUserDto);
  }

  /**
   * Update user account details (ADMIN only)
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.updateUser(id, updateUserDto);
  }

  /**
   * Update user status (ADMIN only)
   */
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async updateUserStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<UserEntity> {
    return this.userService.updateUserStatus(id, updateUserStatusDto);
  }
}
