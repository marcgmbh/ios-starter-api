import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { FriendRequestService } from './services/friend-request.service';
import { FriendshipService } from './services/friendship.service';
import { ContactMatchingService } from './services/contact-matching.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FriendController],
  providers: [
    FriendService,
    FriendRequestService,
    FriendshipService,
    ContactMatchingService,
  ],
  exports: [FriendService],
})
export class FriendModule {}
