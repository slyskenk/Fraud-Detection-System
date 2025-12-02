import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { JwtPayload, RefreshTokenPayload } from './interfaces/jwt-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRATION = '15m'; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRATION = '7d'; // 7 days
  private readonly ACCESS_TOKEN_EXPIRATION_SECONDS = 15 * 60; // 900 seconds

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await this.userRepository.verifyPassword(user, password);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.userRepository.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRATION_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRATION,
    });
  }

  async generateRefreshToken(user: User): Promise<string> {
    const tokenId = uuidv4();
    
    const payload: RefreshTokenPayload = {
      sub: user.id,
      tokenId,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRATION,
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return this.jwtService.verify<RefreshTokenPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  getAccessTokenExpiration(): number {
    return this.ACCESS_TOKEN_EXPIRATION_SECONDS;
  }
}
