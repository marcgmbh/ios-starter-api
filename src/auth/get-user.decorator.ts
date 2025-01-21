import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, RequestUser } from './types';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
