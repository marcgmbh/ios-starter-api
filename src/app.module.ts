import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { FriendModule } from './friend/friend.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule.forRoot(), SupabaseModule, FriendModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
