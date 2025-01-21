import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Friendship } from '../../types/database.types';

@Injectable()
export class FriendshipService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getFriends(userId: string): Promise<Friendship[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('friendships')
      .select(
        `
        *,
        user1:users!friendships_user1_id_fkey (id, username),
        user2:users!friendships_user2_id_fkey (id, username)
      `,
      )
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) throw error;
    return data;
  }

  async deleteFriendship(userId: string, friendId: string): Promise<void> {
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
