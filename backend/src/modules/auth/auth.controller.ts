import { Body, Controller, Get, Patch, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import type { Request, Response } from 'express';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  expiredAdminSessionCookieOptions,
} from '@/modules/auth/auth.cookies';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { AuthService } from '@/modules/auth/auth.service';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Admin login with username and password' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto, request.ip);
    response.cookie(
      ADMIN_SESSION_COOKIE,
      result.token,
      adminSessionCookieOptions(this.configService.get<string>('nodeEnv')),
    );

    return {
      user: result.user,
    };
  }

  @Post('logout')
  @Public()
  @ApiOperation({ summary: 'Clear admin login session' })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(
      ADMIN_SESSION_COOKIE,
      expiredAdminSessionCookieOptions(this.configService.get<string>('nodeEnv')),
    );

    return {
      success: true,
    };
  }

  @Get('profile')
  @Roles(AdminRole.super_admin, AdminRole.editor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.id);
  }

  @Patch('password')
  @Roles(AdminRole.super_admin, AdminRole.editor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current admin password' })
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }
}
