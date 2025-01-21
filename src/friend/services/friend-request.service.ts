import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { FriendRequest } from '../../types/database.types';

@Injectable()
export class FriendRequestService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .select(
        `
        id,
        from_user_id,
        to_user_id,
        status,
        created_at,
        updated_at,
        from_user:profiles(username),
        to_user:profiles(username)
      `,
      )
      .eq('to_user_id', userId)
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  }

  async sendFriendRequest(
    fromUserId: string,
    toUserId: string,
  ): Promise<FriendRequest> {
    // Prevent self-friend requests
    if (fromUserId === toUserId) {
      throw new ConflictException('Cannot send friend request to yourself');
    }

    // Check if request already exists
    const { data: existingRequest } = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .select('*')
      .or(
        `and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`,
      )
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      throw new ConflictException('Friend request already exists');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async respondToFriendRequest(
    requestId: string,
    userId: string,
    accept: boolean,
  ): Promise<void> {
    const { data: request, error: fetchError } = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      throw new NotFoundException('Friend request not found');
    }

    if (request.to_user_id !== userId) {
      throw new ConflictException('Not authorized to respond to this request');
    }

    const status = accept ? 'accepted' : 'rejected';
    const { error: updateError } = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .update({ status })
      .eq('id', requestId);

    if (updateError) throw updateError;

    if (accept) {
      // Check if friendship already exists
      const { data: existingFriendship } = await this.supabaseService
        .getClient()
        .from('friendships')
        .select('*')
        .or(
          `and(user1_id.eq.${request.from_user_id},user2_id.eq.${request.to_user_id}),and(user1_id.eq.${request.to_user_id},user2_id.eq.${request.from_user_id})`,
        )
        .single();

      if (existingFriendship) {
        throw new ConflictException('Friendship already exists');
      }

      const { error: friendshipError } = await this.supabaseService
        .getClient()
        .from('friendships')
        .insert({
          user1_id: request.from_user_id,
          user2_id: request.to_user_id,
        });

      if (friendshipError) throw friendshipError;
    }
  }
}
