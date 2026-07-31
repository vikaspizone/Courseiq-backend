import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { BlacklistedToken } from '../databaseSchema/blacklisted-token.schema';
import { trans } from '../utils/trans';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(BlacklistedToken)
    private readonly blacklistedTokenRepository: Repository<BlacklistedToken>,
  ) {}

  async use(req: Request & { user?: any; token?: string }, res: Response, next: NextFunction) {
    let token = '';

    // Extract from Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedException(trans('auth.token_required'));
    }

    try {
      // Verify JWT token
      const payload = this.jwtService.verify(token);

      // Check if token is blacklisted
      const isBlacklisted = await this.blacklistedTokenRepository.findOne({
        where: { token },
      });
      if (isBlacklisted) {
        throw new UnauthorizedException(trans('auth.token_revoked'));
      }

      // Fetch user from DB
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException(trans('auth.user_not_exist'));
      }

      // Attach user and token to request
      req.user = { id: user.id, email: user.email, role: user.role };
      req.token = token;

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(trans('auth.token_invalid'));
    }
  }
}
