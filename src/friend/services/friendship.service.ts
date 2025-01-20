import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Friendship } from '../types/friend.types';

@Injectable()
export class FriendshipService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getFriends(userId: string): Promise<Friendship[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('friendships')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) throw error;
    return data;
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('friendships')
      .delete()
      .or(
        `and(user1_id.eq.${userId},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${userId})`,
      );

    if (error) throw error;
  }
}
