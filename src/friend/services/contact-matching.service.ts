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
    const { data: matches, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('user_id, username')
      .in('phone_number', phoneNumbers)
      .neq('user_id', currentUserId)
      .not('user_id', 'in', (qb) =>
        qb
          .from('friendships')
          .select('user2_id')
          .eq('user1_id', currentUserId)
          .union((qb) =>
            qb
              .from('friendships')
              .select('user1_id')
              .eq('user2_id', currentUserId),
          ),
      )
      .not('user_id', 'in', (qb) =>
        qb
          .from('friend_requests')
          .select('to_user_id')
          .eq('from_user_id', currentUserId)
          .eq('status', 'pending')
          .union((qb) =>
            qb
              .from('friend_requests')
              .select('from_user_id')
              .eq('to_user_id', currentUserId)
              .eq('status', 'pending'),
          ),
      );

    if (error) throw error;
    return (
      matches?.map((user) => ({
        id: user.user_id,
        username: user.username,
      })) ?? []
    );
  }
}
