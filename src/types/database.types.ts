export type Profile = {
  user_id: string;
  username?: string;
  pfp_url?: string;
  phone_number?: string;
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
  from_user?: { user_id: string; username?: string } | null;
  to_user?: { user_id: string; username?: string } | null;
  direction?: 'sent' | 'received';
};

export type Friendship = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
};

export type FriendshipWithFriend = Friendship & {
  friend: {
    id: string;
    username?: string;
  };
};

export interface ContactMatch {
  id: string;
  username?: string;
}
