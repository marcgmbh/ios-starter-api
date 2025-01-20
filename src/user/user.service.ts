import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const { data: existingUser, error: lookupError } =
      await this.supabaseService
        .getClient()
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    console.log('Looking up profile:', { userId, existingUser, lookupError });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.username) {
      // Check username uniqueness
      const { data: existingUsername } = await this.supabaseService
        .getClient()
        .from('profiles')
        .select('user_id')
        .eq('username', updateProfileDto.username)
        .neq('user_id', userId)
        .single();

      if (existingUsername) {
        throw new ConflictException('Username is already taken');
      }
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .update(updateProfileDto)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
