import { User } from '@supabase/supabase-js';
import { Request } from 'express';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: UserRole;
  aud?: string;
  [key: string]: any;
}

export interface RequestUser extends User {
  id: string;
  aud: string;
  role: UserRole;
  email?: string;
  phone?: string;
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}
