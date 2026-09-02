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
import { UpdateUserStatusDto } from '../dtos';
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
  async getUserById(@Param('id_person') id_person: string): Promise<UserEntity> {
    return this.userService.getUserById(id_person);
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
   * Update user status (ADMIN only)
   */
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
async updateUserStatus(
    @Param('id_person') id_person: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<UserEntity> {
    return this.userService.updateUserStatus(id_person, updateUserStatusDto);
  }
}
