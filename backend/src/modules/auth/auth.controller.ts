import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AuthenticatedUser } from '@/modules/auth/interfaces/authenticated-user.interface';
import { AuthService } from '@/modules/auth/auth.service';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Admin login with username and password' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.id);
  }

  @Patch('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current admin password' })
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }
}
