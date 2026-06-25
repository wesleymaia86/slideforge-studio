import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../../../../app/auth/auth.service';
import type { AuthenticatedUser } from '../../../../domain/auth/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] ?? 'dev-secret-change-me',
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<AuthenticatedUser> {
    try {
      return await this.authService.validateToken(payload);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
