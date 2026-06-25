import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from '../../../app/auth/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserRepository } from '../../../domain/auth/contracts/user.repository';
import { UserRepositoryImpl } from '../../../infra/database/repos/user.repository.impl';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-me',
        signOptions: { expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: UserRepository, useClass: UserRepositoryImpl },
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
