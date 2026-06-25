import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from '../../../app/auth/auth.service';
import { RegisterDto, LoginDto, MagicLinkDto } from './dtos/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../domain/auth/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register with email + password' })
  @ApiResponse({ status: 201, description: 'User created, token returned' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email + password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request magic link (stub)' })
  magicLink(@Body() dto: MagicLinkDto) {
    return this.authService.requestMagicLink(dto.email);
  }

  @Get('google')
  @ApiOperation({ summary: 'Google OAuth redirect (stub)' })
  googleAuth() {
    return { url: this.authService.googleAuthUrl() };
  }

  @Get('microsoft')
  @ApiOperation({ summary: 'Microsoft OAuth redirect (stub)' })
  microsoftAuth() {
    return { url: this.authService.microsoftAuthUrl() };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
