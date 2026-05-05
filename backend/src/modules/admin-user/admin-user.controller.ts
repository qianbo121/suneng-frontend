import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';

import { Roles } from '@/common/decorators/roles.decorator';
import { AdminUserListQueryDto } from '@/modules/admin-user/dto/admin-user-list-query.dto';
import { CreateAdminUserDto } from '@/modules/admin-user/dto/create-admin-user.dto';
import { UpdateAdminUserPasswordDto } from '@/modules/admin-user/dto/update-admin-user-password.dto';
import { UpdateAdminUserDto } from '@/modules/admin-user/dto/update-admin-user.dto';
import { AdminUserService } from '@/modules/admin-user/admin-user.service';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Roles(AdminRole.super_admin)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @ApiOperation({ summary: 'Get admin user list' })
  findAll(@Query() query: AdminUserListQueryDto) {
    return this.adminUserService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new admin user' })
  create(@Body() createDto: CreateAdminUserDto) {
    return this.adminUserService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an admin user' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateAdminUserDto) {
    return this.adminUserService.update(id, updateDto);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Update an admin user password' })
  updatePassword(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminUserPasswordDto) {
    return this.adminUserService.updatePassword(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle admin user active status' })
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.adminUserService.toggle(id);
  }
}
