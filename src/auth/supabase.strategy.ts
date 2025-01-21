import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtPayload, RequestUser, UserRole } from './types';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(private readonly supabaseService: SupabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SUPABASE_JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Create a properly typed RequestUser without additional verification
    const requestUser: RequestUser = {
      id: payload.sub,
      aud: payload.aud || 'authenticated',
      role: payload.role as UserRole,
      email: payload.email,
      phone: payload.phone,
      app_metadata: payload.app_metadata,
      user_metadata: payload.user_metadata,
      created_at: payload.iat
        ? new Date(payload.iat * 1000).toISOString()
        : new Date().toISOString(),
    };

    return requestUser;
  }
}
