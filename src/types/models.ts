export enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
}

export interface Profile {
  id: string;
  username: string;
  pfpUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  sentRequests?: FriendRequest[];
  receivedRequests?: FriendRequest[];
  friendshipsAsUser1?: Friendship[];
  friendshipsAsUser2?: Friendship[];
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  fromUser?: Profile;
  toUser?: Profile;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  user1?: Profile;
  user2?: Profile;
}
