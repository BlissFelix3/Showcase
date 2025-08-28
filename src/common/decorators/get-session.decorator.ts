import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface SessionData {
  id: string;
  userId: string;
  email: string;
  role: string;
  jurisdictionId?: string;
}

interface AuthenticatedUser {
  userId?: string;
  id?: string;
  email: string;
  role: string;
  jurisdictionId?: string;
}

interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}

export const GetSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SessionData | null => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (user?.userId || user?.id) {
      return {
        id: user.userId || user.id!,
        userId: user.userId || user.id!,
        email: user.email,
        role: user.role,
        jurisdictionId: user.jurisdictionId,
      };
    }
    return null;
  },
);
