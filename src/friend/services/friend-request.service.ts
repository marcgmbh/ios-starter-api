import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { FriendRequest } from '../types/friend.types';

@Injectable()
export class FriendRequestService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async sendFriendRequest(
    fromUserId: string,
    toUserId: string,
  ): Promise<FriendRequest> {
    // Check if users are already friends
    const existingFriendship = await this.supabaseService
      .getClient()
      .from('friendships')
      .select('*')
      .or(`user1_id.eq.${fromUserId},user2_id.eq.${fromUserId}`)
      .or(`user1_id.eq.${toUserId},user2_id.eq.${toUserId}`)
      .single();

    if (existingFriendship.data) {
      throw new BadRequestException('Users are already friends');
    }

    // Check for existing friend requests
    const existingRequest = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .select('*')
      .or(
        `and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`,
      )
      .neq('status', 'rejected')
      .single();

    if (existingRequest.data) {
      throw new BadRequestException('Friend request already exists');
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

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .neq('status', 'rejected');

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
      throw new BadRequestException('Friend request not found');
    }

    if (request.to_user_id !== userId) {
      throw new BadRequestException('Not authorized to respond to this request');
    }

    if (accept) {
      await this.supabaseService
        .getClient()
        .from('friendships')
        .insert({
          user1_id: request.from_user_id,
          user2_id: request.to_user_id,
        });
    }

    const { error: updateError } = await this.supabaseService
      .getClient()
      .from('friend_requests')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', requestId);

    if (updateError) throw updateError;
  }
}
