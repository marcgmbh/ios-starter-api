import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfile(userId: string) {
    try {
      const { data: profile, error } = await this.supabaseService
        .getClient()
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        this.logger.error('Database error while fetching profile', {
          userId,
          error,
        });
        throw new InternalServerErrorException('Error fetching profile');
      }

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      return profile;
    } catch (error) {
      this.logger.error('Error in getProfile', { userId, error });
      throw error;
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      const { data: existingUser, error: lookupError } =
        await this.supabaseService
          .getClient()
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

      if (lookupError) {
        this.logger.error('Database error while looking up profile', {
          userId,
          error: lookupError,
        });
        throw new InternalServerErrorException('Error looking up profile');
      }

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (updateProfileDto.username) {
        // Check username uniqueness
        const { data: existingUsername, error: usernameError } =
          await this.supabaseService
            .getClient()
            .from('profiles')
            .select('user_id')
            .eq('username', updateProfileDto.username)
            .neq('user_id', userId)
            .single();

        if (usernameError) {
          this.logger.error('Database error while checking username', {
            userId,
            username: updateProfileDto.username,
            error: usernameError,
          });
          throw new InternalServerErrorException('Error checking username');
        }

        if (existingUsername) {
          throw new ConflictException('Username is already taken');
        }
      }

      const { data: profile, error } = await this.supabaseService
        .getClient()
        .from('profiles')
        .update(updateProfileDto)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        this.logger.error('Database error while updating profile', {
          userId,
          updates: updateProfileDto,
          error,
        });
        throw new InternalServerErrorException('Error updating profile');
      }

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      return profile;
    } catch (error) {
      this.logger.error('Error in updateProfile', {
        userId,
        updates: updateProfileDto,
        error,
      });
      throw error;
    }
  }
}
