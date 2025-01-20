export type Profile = {
  user_id: string;
  username?: string;
  pfp_url?: string;
  created_at: string;
  updated_at: string;
};

export type FriendRequest = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'canceled';
  created_at: string;
  updated_at: string;
};

export type Friendship = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
};

export interface ContactMatch {
  id: string;
  phoneNumber: string;
}
