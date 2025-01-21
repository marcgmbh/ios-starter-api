import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FriendService } from './friend.service';
import {
  FriendRequest,
  Friendship,
  ContactMatch,
} from '../types/database.types';
import { GetUser } from '../auth/get-user.decorator';
import { RequestUser } from '../auth/types';
import { Throttle } from '@nestjs/throttler';

@Controller('friends')
@UseGuards(AuthGuard('supabase'))
export class FriendController {
  private readonly logger = new Logger(FriendController.name);

  constructor(private readonly friendService: FriendService) {}

  @Get()
  async getFriends(@GetUser() user: RequestUser): Promise<Friendship[]> {
    try {
      return await this.friendService.getFriends(user.id);
    } catch (error) {
      this.logger.error('Error fetching friends', { userId: user.id, error });
      throw new InternalServerErrorException('Failed to fetch friends');
    }
  }

  @Get('requests/pending')
  async getPendingRequests(
    @GetUser() user: RequestUser,
  ): Promise<FriendRequest[]> {
    try {
      return await this.friendService.getPendingRequests(user.id);
    } catch (error) {
      this.logger.error('Error fetching pending requests', {
        userId: user.id,
        error,
      });
      throw new InternalServerErrorException(
        'Failed to fetch pending requests',
      );
    }
  }

  @Post('request/:toUserId')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 friend requests per minute
  async sendFriendRequest(
    @GetUser() user: RequestUser,
    @Param('toUserId') toUserId: string,
  ): Promise<FriendRequest> {
    try {
      return await this.friendService.sendFriendRequest(user.id, toUserId);
    } catch (error) {
      this.logger.error('Error sending friend request', {
        fromUserId: user.id,
        toUserId,
        error,
      });
      throw new InternalServerErrorException('Failed to send friend request');
    }
  }

  @Post('request/:requestId/respond')
  async respondToFriendRequest(
    @GetUser() user: RequestUser,
    @Param('requestId') requestId: string,
    @Body('accept') accept: boolean,
  ): Promise<void> {
    try {
      await this.friendService.respondToFriendRequest(
        requestId,
        user.id,
        accept,
      );
    } catch (error) {
      this.logger.error('Error responding to friend request', {
        userId: user.id,
        requestId,
        accept,
        error,
      });
      throw new InternalServerErrorException(
        'Failed to respond to friend request',
      );
    }
  }

  @Delete(':friendId')
  async deleteFriend(
    @GetUser() user: RequestUser,
    @Param('friendId') friendId: string,
  ): Promise<void> {
    try {
      await this.friendService.deleteFriendship(user.id, friendId);
    } catch (error) {
      this.logger.error('Error deleting friend', {
        userId: user.id,
        friendId,
        error,
      });
      throw new InternalServerErrorException('Failed to delete friend');
    }
  }

  @Post('contacts/match')
  async matchContacts(
    @GetUser() user: RequestUser,
    @Body('phoneNumbers') phoneNumbers: string[],
  ): Promise<ContactMatch[]> {
    try {
      return await this.friendService.findUsersByPhoneNumbers(
        phoneNumbers,
        user.id,
      );
    } catch (error) {
      this.logger.error('Error matching contacts', {
        userId: user.id,
        phoneNumbersCount: phoneNumbers?.length,
        error,
      });
      throw new InternalServerErrorException('Failed to match contacts');
    }
  }
}
