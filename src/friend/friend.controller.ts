import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import {
  FriendRequest,
  Friendship,
  ContactMatch,
} from '../types/database.types';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get()
  async getFriends(
    // TODO: Get userId from authenticated user
    @Body('userId') userId: string,
  ): Promise<Friendship[]> {
    return this.friendService.getFriends(userId);
  }

  @Get('requests/pending')
  async getPendingRequests(
    // TODO: Get userId from authenticated user
    @Body('userId') userId: string,
  ): Promise<FriendRequest[]> {
    return this.friendService.getPendingRequests(userId);
  }

  @Post('request/:toUserId')
  async sendFriendRequest(
    @Param('toUserId') toUserId: string,
    // TODO: Get fromUserId from authenticated user
    @Body('fromUserId') fromUserId: string,
  ): Promise<FriendRequest> {
    return this.friendService.sendFriendRequest(fromUserId, toUserId);
  }

  @Post('request/:requestId/respond')
  async respondToFriendRequest(
    @Param('requestId') requestId: string,
    // TODO: Get userId from authenticated user
    @Body('userId') userId: string,
    @Body('accept') accept: boolean,
  ): Promise<void> {
    return this.friendService.respondToFriendRequest(requestId, userId, accept);
  }

  @Delete(':friendId')
  async deleteFriend(
    @Param('friendId') friendId: string,
    // TODO: Get userId from authenticated user
    @Body('userId') userId: string,
  ): Promise<void> {
    return this.friendService.deleteFriendship(userId, friendId);
  }

  @Post('contacts/match')
  async matchContacts(
    @Body('userId') userId: string,
    @Body('phoneNumbers') phoneNumbers: string[],
  ): Promise<ContactMatch[]> {
    return this.friendService.findUsersByPhoneNumbers(userId, phoneNumbers);
  }
}
