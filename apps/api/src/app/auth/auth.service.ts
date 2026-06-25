import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../domain/auth/contracts/user.repository';
import type { AuthenticatedUser } from '../../domain/auth/entities/user.entity';

export interface TokenPair {
  accessToken: string;
  user: AuthenticatedUser;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string, name?: string): Promise<TokenPair> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepo.create({ email, name, passwordHash });

    this.logger.log(`User registered: ${user.id}`);
    return this.issueToken(user);
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueToken(user);
  }

  async validateToken(payload: { sub: string }): Promise<AuthenticatedUser> {
    const user = await this.userRepo.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    return { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin };
  }

  async getProfile(userId: string): Promise<AuthenticatedUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin };
  }

  // Stub: magic link — in production this would send an email
  async requestMagicLink(email: string): Promise<{ message: string }> {
    this.logger.log(`Magic link requested for ${email} (stub)`);
    return { message: 'Magic link sent (stub)' };
  }

  // Stub: OAuth redirect URLs
  googleAuthUrl(): string {
    return '/auth/google (stub — configure GOOGLE_CLIENT_ID)';
  }

  microsoftAuthUrl(): string {
    return '/auth/microsoft (stub — configure MICROSOFT_CLIENT_ID)';
  }

  private issueToken(user: { id: string; email: string; name: string | null; isSuperAdmin: boolean }): TokenPair {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin },
    };
  }
}
