import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { BlacklistedToken } from '../databaseSchema/blacklisted-token.schema';
import { trans } from '../utils/trans';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(BlacklistedToken)
    private readonly blacklistedTokenRepository: Repository<BlacklistedToken>,
  ) {}

  // User Signup
  async signup(signupDto: SignupDto) {
    const { email, password, role } = signupDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(trans('auth.email_registered'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.usersService.create(email, hashedPassword, role);

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      message: trans('auth.user_registered'),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  // User Login
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(trans('auth.user_not_found'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new BadRequestException(trans('auth.invalid_password'));
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      message: trans('auth.login_successful'),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  // Refresh Access Token
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findByEmail(payload.email);

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException(trans('auth.refresh_token_invalid'));
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException(trans('auth.refresh_token_invalid'));
      }

      const tokens = await this.generateTokens(user.id, user.email);
      return {
        message: trans('auth.tokens_refreshed'),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException(trans('auth.refresh_token_invalid'));
    }
  }

  // User Logout
  async logout(userId: string, accessToken: string) {
    await this.usersService.updateRefreshToken(userId, null);

    try {
      const decoded = this.jwtService.decode(accessToken) as any;
      const expiresAt = decoded && decoded.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // fallback to 24h

      const blacklisted = this.blacklistedTokenRepository.create({
        token: accessToken,
        expiresAt,
      });
      await this.blacklistedTokenRepository.save(blacklisted);
    } catch (err) {
      const blacklisted = this.blacklistedTokenRepository.create({
        token: accessToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      await this.blacklistedTokenRepository.save(blacklisted);
    }

    return {
      message: trans('auth.logged_out'),
    };
  }

  // Helper function to sign Access and Refresh tokens
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '1d';
    const refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const accessToken = this.jwtService.sign(payload, { expiresIn: accessExpiry as any });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: refreshExpiry as any });

    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}

