import { Injectable } from '@nestjs/common';
import {
  FriendRequest,
  Friendship,
  ContactMatch,
} from '../types/database.types';
import { FriendRequestService } from './services/friend-request.service';
import { FriendshipService } from './services/friendship.service';
import { ContactMatchingService } from './services/contact-matching.service';

@Injectable()
export class FriendService {
  constructor(
    private readonly friendRequestService: FriendRequestService,
    private readonly friendshipService: FriendshipService,
    private readonly contactMatchingService: ContactMatchingService,
  ) {}

  getFriends(userId: string): Promise<Friendship[]> {
    return this.friendshipService.getFriends(userId);
  }

  getPendingRequests(userId: string): Promise<FriendRequest[]> {
    return this.friendRequestService.getPendingRequests(userId);
  }

  sendFriendRequest(
    fromUserId: string,
    toUserId: string,
  ): Promise<FriendRequest> {
    return this.friendRequestService.sendFriendRequest(fromUserId, toUserId);
  }

  respondToFriendRequest(
    requestId: string,
    userId: string,
    accept: boolean,
  ): Promise<void> {
    return this.friendRequestService.respondToFriendRequest(
      requestId,
      userId,
      accept,
    );
  }

  deleteFriendship(userId: string, friendId: string): Promise<void> {
    return this.friendshipService.deleteFriendship(userId, friendId);
  }

  findUsersByPhoneNumbers(
    userId: string,
    phoneNumbers: string[],
  ): Promise<ContactMatch[]> {
    return this.contactMatchingService.findUsersByPhoneNumbers(
      userId,
      phoneNumbers,
    );
  }
}
