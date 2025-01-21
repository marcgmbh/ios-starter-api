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
    // First get all friend IDs
    const { data: friendIds } = await this.supabaseService
      .getClient()
      .from('friendships')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

    // Get all pending request user IDs
    const { data: pendingRequestIds } = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .select('from_user_id, to_user_id')
      .eq('status', 'pending')
      .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`);

    // Create sets of IDs to exclude
    const excludeIds = new Set<string>([currentUserId]);

    friendIds?.forEach((f) => {
      excludeIds.add(f.user1_id);
      excludeIds.add(f.user2_id);
    });

    pendingRequestIds?.forEach((r) => {
      excludeIds.add(r.from_user_id);
      excludeIds.add(r.to_user_id);
    });

    // Get matching users excluding friends and pending requests
    const { data: matches, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('user_id, username')
      .in('phone_number', phoneNumbers)
      .not('user_id', 'in', Array.from(excludeIds));

    if (error) throw error;
    return (
      matches?.map((user) => ({
        id: user.user_id,
        username: user.username,
      })) ?? []
    );
  }
}
