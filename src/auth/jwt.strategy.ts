import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  role: string;
}

interface RequestWithHeaders {
  headers: {
    authorization?: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: RequestWithHeaders) => {
        if (req.headers.authorization) {
          return req.headers.authorization.replace('Bearer ', '');
        }
        return null;
      },
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ userId: string; role: string }> {
    try {
      if (!payload.sub || !payload.role) {
        throw new UnauthorizedException('Invalid token payload');
      }

      await new Promise((resolve) => setTimeout(resolve, 10));

      return { userId: payload.sub, role: payload.role };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
