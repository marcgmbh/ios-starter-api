import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ContactMatch } from '../../types/database.types';

@Injectable()
export class ContactMatchingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findUsersByPhoneNumbers(
    phoneNumbers: string[],
    currentUserId: string,
  ): Promise<ContactMatch[]> {
    // Get users with matching phone numbers from profiles
    const { data: matches, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('user_id, username')
      .in('phone_number', phoneNumbers);

    if (error) throw error;
    if (!matches?.length) return [];

    // Get existing friendships for current user
    const { data: friendships } = await this.supabaseService
      .getClient()
      .from('friendships')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

    // Get pending friend requests (both sent and received)
    const { data: pendingRequests } = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .select('from_user_id, to_user_id')
      .eq('status', 'pending')
      .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`);

    // Create sets for quick lookup
    const friendIds = new Set(
      (friendships || []).flatMap((friendship) => [
        friendship.user1_id,
        friendship.user2_id,
      ]),
    );

    const pendingRequestIds = new Set(
      (pendingRequests || []).flatMap((request) => [
        request.from_user_id,
        request.to_user_id,
      ]),
    );

    // Filter out users who are:
    // 1. The current user
    // 2. Already friends
    // 3. Have pending requests
    return matches
      .filter(
        (user) =>
          user.user_id !== currentUserId &&
          !friendIds.has(user.user_id) &&
          !pendingRequestIds.has(user.user_id),
      )
      .map((user) => ({
        id: user.user_id,
        username: user.username,
      }));
  }
}
