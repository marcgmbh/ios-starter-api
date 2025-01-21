import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './supabase.strategy';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'supabase' }),
    SupabaseModule,
  ],
  providers: [SupabaseStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
