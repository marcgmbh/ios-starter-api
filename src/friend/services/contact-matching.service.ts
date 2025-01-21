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

    // Get existing friendships
    const { data: friendships } = await this.supabaseService
      .getClient()
      .from('friendships')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

    // Get pending friend requests
    const { data: pendingRequests } = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .select('from_user_id, to_user_id')
      .eq('status', 'pending')
      .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`);

    // Create sets for quick lookups
    const friendIds = new Set(
      (friendships || [])
        .flatMap((friendship) => [friendship.user1_id, friendship.user2_id])
        .filter((id) => id !== currentUserId),
    );

    const pendingRequestIds = new Set(
      (pendingRequests || [])
        .flatMap((request) => [request.from_user_id, request.to_user_id])
        .filter((id) => id !== currentUserId),
    );

    // Filter out users who are already friends or have pending requests
    return matches
      .filter(
        (user) =>
          user.user_id !== currentUserId && // Filter out current user
          !friendIds.has(user.user_id) && // Filter out friends
          !pendingRequestIds.has(user.user_id), // Filter out pending requests
      )
      .map((user) => ({
        id: user.user_id,
        username: user.username,
      }));
  }
}
