import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { TokenService } from './services/token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  private readonly REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
  private readonly REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.login(loginDto.email, loginDto.password);

    // Generate refresh token
    const user = await this.authService['userRepository'].findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const refreshToken = await this.authService.generateRefreshToken(user);
    
    // Store refresh token in Redis
    const refreshPayload = await this.authService.verifyRefreshToken(refreshToken);
    await this.tokenService.storeRefreshToken(user.id, refreshPayload.tokenId, refreshToken);

    // Set refresh token as HTTP-only cookie
    response.cookie(this.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.REFRESH_TOKEN_COOKIE_MAX_AGE,
    });

    return authResponse;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = request.cookies[this.REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const authResponse = await this.tokenService.refreshAccessToken(refreshToken);

    // Get new refresh token from the response
    const user = await this.authService['userRepository'].findById(authResponse.user.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newRefreshToken = await this.authService.generateRefreshToken(user);
    const newRefreshPayload = await this.authService.verifyRefreshToken(newRefreshToken);
    await this.tokenService.storeRefreshToken(user.id, newRefreshPayload.tokenId, newRefreshToken);

    // Set new refresh token as HTTP-only cookie
    response.cookie(this.REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.REFRESH_TOKEN_COOKIE_MAX_AGE,
    });

    return authResponse;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request & { user: User },
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const user = request.user;
    const accessToken = this.extractTokenFromHeader(request);
    const refreshToken = request.cookies[this.REFRESH_TOKEN_COOKIE_NAME];

    if (!accessToken) {
      throw new UnauthorizedException('Access token not found');
    }

    // Get refresh token ID if available
    let refreshTokenId: string | undefined;
    if (refreshToken) {
      try {
        const refreshPayload = await this.authService.verifyRefreshToken(refreshToken);
        refreshTokenId = refreshPayload.tokenId;
      } catch (error) {
        // Refresh token is invalid or expired, continue with logout
      }
    }

    // Logout (blacklist access token and delete refresh tokens)
    await this.tokenService.logout(user.id, accessToken, refreshTokenId);

    // Clear refresh token cookie
    response.clearCookie(this.REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { message: 'Logged out successfully' };
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
