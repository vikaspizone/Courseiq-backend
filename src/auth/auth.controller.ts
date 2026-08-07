import { Controller, Post, Body, Get, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { handlePromise } from '../utils/async-handler';
import { DataSource, In } from 'typeorm';
import { RolePermissionEntity } from '../databaseSchema/role-permission.schema';
import { PermissionEntity } from '../databaseSchema/permission.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

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
    const [result, error] = await handlePromise(this.authService.refresh(refreshTokenDto.refresh_token));
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
  async getProfile(@Request() req) {
    const user = req.user;
    const permissions = await this.getRolePermissionsMap(user.role.id, user.role.name);
    return {
      ...user,
      permissions,
    };
  }

  private async getRolePermissionsMap(roleId: string, roleName: string): Promise<Record<string, string[]>> {
    if (roleName === 'admin') {
      return { '*': ['*'] };
    }

    const rolePermissions = await this.dataSource.getRepository(RolePermissionEntity).find({
      where: { role_id: roleId },
    });

    const result: Record<string, string[]> = {};

    for (const rp of rolePermissions) {
      if (!rp.module_id) {
        continue;
      }

      if (rp.permission_ids && rp.permission_ids.length > 0) {
        const permissions = await this.dataSource.getRepository(PermissionEntity).find({
          where: {
            id: In(rp.permission_ids),
            is_active: true,
          },
        });
        const codes = permissions.map((p) => p.code).filter((c): c is string => !!c);
        result[rp.module_id] = codes;
      } else {
        result[rp.module_id] = [];
      }
    }

    return result;
  }
}

