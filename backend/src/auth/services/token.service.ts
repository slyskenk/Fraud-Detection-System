import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { AuthService } from '../auth.service';
import { UserRepository } from '../../repositories/user.repository';
import { RefreshTokenPayload } from '../interfaces/jwt-payload.interface';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class TokenService {
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
  private readonly BLACKLIST_PREFIX = 'blacklist:';
  private readonly BLACKLIST_TTL = 15 * 60; // 15 minutes in seconds

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  async storeRefreshToken(userId: string, tokenId: string, token: string): Promise<void> {
    const key = this.getRefreshTokenKey(userId, tokenId);
    await this.redis.setex(key, this.REFRESH_TOKEN_TTL, token);
  }

  async getRefreshToken(userId: string, tokenId: string): Promise<string | null> {
    const key = this.getRefreshTokenKey(userId, tokenId);
    return this.redis.get(key);
  }

  async deleteRefreshToken(userId: string, tokenId: string): Promise<void> {
    const key = this.getRefreshTokenKey(userId, tokenId);
    await this.redis.del(key);
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    const pattern = this.getRefreshTokenKey(userId, '*');
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResponseDto> {
    // Verify refresh token
    const payload = await this.authService.verifyRefreshToken(refreshToken);

    // Check if token exists in Redis
    const storedToken = await this.getRefreshToken(payload.sub, payload.tokenId);
    
    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user
    const user = await this.userRepository.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Invalidate old refresh token (rotation)
    await this.deleteRefreshToken(payload.sub, payload.tokenId);

    // Generate new tokens
    const accessToken = await this.authService.generateAccessToken(user);
    const newRefreshToken = await this.authService.generateRefreshToken(user);

    // Store new refresh token
    const newPayload = await this.authService.verifyRefreshToken(newRefreshToken);
    await this.storeRefreshToken(user.id, newPayload.tokenId, newRefreshToken);

    return {
      accessToken,
      expiresIn: this.authService.getAccessTokenExpiration(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async blacklistAccessToken(token: string, userId: string): Promise<void> {
    const key = this.getBlacklistKey(token);
    await this.redis.setex(key, this.BLACKLIST_TTL, userId);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = this.getBlacklistKey(token);
    const result = await this.redis.get(key);
    return result !== null;
  }

  private getRefreshTokenKey(userId: string, tokenId: string): string {
    return `${this.REFRESH_TOKEN_PREFIX}${userId}:${tokenId}`;
  }

  async logout(userId: string, accessToken: string, refreshTokenId?: string): Promise<void> {
    // Blacklist the access token
    await this.blacklistAccessToken(accessToken, userId);

    // If refresh token ID is provided, delete it
    if (refreshTokenId) {
      await this.deleteRefreshToken(userId, refreshTokenId);
    } else {
      // Delete all refresh tokens for the user
      await this.deleteAllUserRefreshTokens(userId);
    }
  }

  private getBlacklistKey(token: string): string {
    return `${this.BLACKLIST_PREFIX}${token}`;
  }
}
