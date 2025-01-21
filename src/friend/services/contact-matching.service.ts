import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ContactMatch } from '../../types/database.types';

@Injectable()
export class ContactMatchingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findUsersByPhoneNumbers(
    userId: string,
    phoneNumbers: string[],
  ): Promise<ContactMatch[]> {
    // Get users with matching phone numbers from profiles
    const { data: matches, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('user_id, username')
      .in('phone_number', phoneNumbers)
      .neq('user_id', userId); // Exclude current user

    if (error) throw error;
    if (!matches?.length) return [];

    // Get existing friendships
    const { data: friendships } = await this.supabaseService
      .getClient()
      .from('friendships')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    // Create a set of friend IDs
    const friendIds = new Set(
      (friendships || []).flatMap((friendship) => [
        friendship.user1_id,
        friendship.user2_id,
      ]),
    );

    // Filter out users who are already friends
    return matches
      .filter((user) => !friendIds.has(user.user_id))
      .map((user) => ({
        id: user.user_id,
        username: user.username,
      }));
  }
}
