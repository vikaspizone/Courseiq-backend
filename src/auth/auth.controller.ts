import { Controller, Post, Body, Get, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { handlePromise } from '../utils/async-handler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({})
  async signup(@Body() signupDto: SignupDto) {
    const [result, error] = await handlePromise(this.authService.signup(signupDto));
    if (error) throw error;
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({})
  async login(@Body() loginDto: LoginDto) {
    const [result, error] = await handlePromise(this.authService.login(loginDto));
    if (error) throw error;
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({})
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const [result, error] = await handlePromise(this.authService.refresh(refreshTokenDto.refreshToken));
    if (error) throw error;
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({})
  async logout(@Request() req) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const [result, error] = await handlePromise(this.authService.logout(req.user.id, token));
    if (error) throw error;
    return result;
  }

  // Example of a route protected with JWT guard
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({})
  getProfile(@Request() req) {
    return req.user;
  }
}

