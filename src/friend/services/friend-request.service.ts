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
    const supabase = this.supabaseService.getClient();

    // First get the friend requests
    const { data: requests, error: requestError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('to_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestError) throw requestError;
    if (!requests) return [];

    // Get all unique user IDs from the requests
    const userIds = [...new Set(requests.map((r) => r.from_user_id))];

    // Then get the profiles for these users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, username')
      .in('user_id', userIds);

    if (profileError) throw profileError;
    if (!profiles) return requests;

    // Map profiles to requests
    const profileMap = new Map(profiles.map((p) => [p.user_id, p]));

    return requests.map((request) => ({
      ...request,
      from_user: profileMap.get(request.from_user_id) || null,
      to_user: { user_id: userId }, // Current user is always the receiver
    }));
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
