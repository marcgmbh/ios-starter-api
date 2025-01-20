import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ContactMatch } from '../types/friend.types';

@Injectable()
export class ContactMatchingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async matchContactsToUsers(
    userId: string,
    phoneNumbers: string[],
  ): Promise<ContactMatch[]> {
    if (!phoneNumbers.length) {
      throw new BadRequestException('Phone numbers array is empty');
    }

    const { data: matches, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('id, phone_number')
      .in('phone_number', phoneNumbers)
      .not('id', 'eq', userId);

    if (error) throw error;

    // Exclude users who are already friends or have pending friend requests
    const { data: existingConnections } = await this.supabaseService
      .getClient()
      .from('friendships')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (!matches) return [];

    const existingFriendIds = new Set(
      (existingConnections || []).flatMap((friendship) => [
        friendship.user1_id,
        friendship.user2_id,
      ]),
    );

    return matches
      .filter((match) => !existingFriendIds.has(match.id))
      .map((match) => ({
        id: match.id,
        phoneNumber: match.phone_number,
      }));
  }
}
