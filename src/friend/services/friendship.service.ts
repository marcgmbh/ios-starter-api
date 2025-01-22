import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Friendship, FriendshipWithFriend } from '../../types/database.types';

@Injectable()
export class FriendshipService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getFriends(userId: string): Promise<FriendshipWithFriend[]> {
    const supabase = this.supabaseService.getClient();

    // Get all friendships
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (friendshipsError) {
      console.error('Error getting friendships:', friendshipsError);
      throw friendshipsError;
    }

    if (!friendships?.length) {
      return [];
    }

    // Get all friend IDs
    const friendIds = friendships.map((friendship) =>
      friendship.user1_id === userId
        ? friendship.user2_id
        : friendship.user1_id,
    );

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username')
      .in('user_id', friendIds);

    if (profilesError) {
      console.error('Error getting profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles?.length) {
      return [];
    }

    // Map the profiles to our expected format
    return friendships
      .map((friendship) => {
        const friendId =
          friendship.user1_id === userId
            ? friendship.user2_id
            : friendship.user1_id;

        const friendProfile = profiles.find(
          (profile) => profile.user_id === friendId,
        );

        if (!friendProfile) {
          return null;
        }

        return {
          ...friendship,
          friend: {
            id: friendProfile.user_id,
            username: friendProfile.username,
          },
        };
      })
      .filter(Boolean) as FriendshipWithFriend[];
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
