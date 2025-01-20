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
import { FriendRequest, Friendship, ContactMatch } from '../types/database.types';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

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

  @Get('requests')
  async getFriendRequests(
    // TODO: Get userId from authenticated user
    @Body('userId') userId: string,
  ): Promise<FriendRequest[]> {
    return this.friendService.getFriendRequests(userId);
  }

  @Get()
  async getFriends(
    // TODO: Get userId from authenticated user
    @Body('userId') userId: string,
  ): Promise<Friendship[]> {
    return this.friendService.getFriends(userId);
  }

  @Delete(':friendId')
  async removeFriend(
    @Param('friendId') friendId: string,
    // TODO: Get userId from authenticated user
    @Body('userId') userId: string,
  ): Promise<void> {
    return this.friendService.removeFriend(userId, friendId);
  }

  @Post('contacts/match')
  async matchContactsToUsers(
    @Body('userId') userId: string,
    @Body('phoneNumbers') phoneNumbers: string[],
  ): Promise<ContactMatch[]> {
    return this.friendService.matchContactsToUsers(userId, phoneNumbers);
  }
}
