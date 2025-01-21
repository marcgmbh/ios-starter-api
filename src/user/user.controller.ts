import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUser } from '../auth/get-user.decorator';
import { RequestUser } from '../auth/types';

@Controller('users')
@UseGuards(AuthGuard('supabase'))
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('me/profile')
  async getMyProfile(@GetUser() user: RequestUser) {
    try {
      const profile = await this.userService.getProfile(user.id);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      return profile;
    } catch (error) {
      this.logger.error('Error fetching user profile', {
        userId: user.id,
        error,
      });
      throw error;
    }
  }

  @Get(':userId/profile')
  async getProfile(@Param('userId') userId: string) {
    try {
      const profile = await this.userService.getProfile(userId);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      return profile;
    } catch (error) {
      this.logger.error('Error fetching user profile', {
        userId,
        error,
      });
      throw error;
    }
  }

  @Patch('me/profile')
  async updateProfile(
    @GetUser() user: RequestUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    try {
      const updatedProfile = await this.userService.updateProfile(
        user.id,
        updateProfileDto,
      );
      if (!updatedProfile) {
        throw new NotFoundException('Profile not found');
      }
      return updatedProfile;
    } catch (error) {
      this.logger.error('Error updating user profile', {
        userId: user.id,
        updates: updateProfileDto,
        error,
      });
      throw error;
    }
  }
}
