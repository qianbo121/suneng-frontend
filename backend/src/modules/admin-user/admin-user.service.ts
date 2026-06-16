import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AdminRole, AdminUser, Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';

import { buildPagination } from '@/common/utils/pagination';
import { AdminUserListQueryDto } from '@/modules/admin-user/dto/admin-user-list-query.dto';
import { CreateAdminUserDto } from '@/modules/admin-user/dto/create-admin-user.dto';
import { UpdateAdminUserPasswordDto } from '@/modules/admin-user/dto/update-admin-user-password.dto';
import { UpdateAdminUserDto } from '@/modules/admin-user/dto/update-admin-user.dto';
import { PrismaService } from '@/prisma/prisma.service';

const adminUserSelect = {
  id: true,
  username: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AdminUserSelect;

@Injectable()
export class AdminUserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: AdminUserListQueryDto) {
    const { page, pageSize, skip, take } = buildPagination(query);
    const where: Prisma.AdminUserWhereInput = {
      role: query.role,
      ...(query.keyword
        ? {
            username: {
              contains: query.keyword,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.adminUser.findMany({
        where,
        skip,
        take,
        orderBy: [{ createdAt: 'desc' }],
        select: adminUserSelect,
      }),
      this.prismaService.adminUser.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async create(createDto: CreateAdminUserDto) {
    const passwordHash = await hash(createDto.password, 10);

    return this.prismaService.adminUser.create({
      data: {
        username: createDto.username.trim(),
        passwordHash,
        role: createDto.role ?? AdminRole.editor,
        isActive: createDto.isActive ?? true,
      },
      select: adminUserSelect,
    });
  }

  async update(id: number, updateDto: UpdateAdminUserDto, actorId: number) {
    const user = await this.ensureExists(id);
    await this.ensureActiveSuperAdminRemains(user, updateDto, actorId);

    return this.prismaService.adminUser.update({
      where: { id },
      data: {
        username: updateDto.username?.trim(),
        role: updateDto.role,
        isActive: updateDto.isActive,
      },
      select: adminUserSelect,
    });
  }

  async updatePassword(id: number, dto: UpdateAdminUserPasswordDto) {
    await this.ensureExists(id);

    return this.prismaService.adminUser.update({
      where: { id },
      data: {
        passwordHash: await hash(dto.password, 10),
      },
      select: adminUserSelect,
    });
  }

  async toggle(id: number, actorId: number) {
    const user = await this.ensureExists(id);
    await this.ensureActiveSuperAdminRemains(user, { isActive: !user.isActive }, actorId);

    return this.prismaService.adminUser.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      select: adminUserSelect,
    });
  }

  private async ensureExists(id: number) {
    const user = await this.prismaService.adminUser.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    return user;
  }

  private async ensureActiveSuperAdminRemains(
    user: AdminUser,
    updateDto: Pick<UpdateAdminUserDto, 'role' | 'isActive'>,
    actorId: number,
  ) {
    const nextRole = updateDto.role ?? user.role;
    const nextIsActive = updateDto.isActive ?? user.isActive;
    const removesActiveSuperAdmin =
      user.role === AdminRole.super_admin &&
      user.isActive &&
      (nextRole !== AdminRole.super_admin || !nextIsActive);

    if (!removesActiveSuperAdmin) return;

    if (user.id === actorId) {
      throw new BadRequestException('不能停用或降级当前登录的超级管理员账号');
    }

    const remainingActiveSuperAdmins = await this.prismaService.adminUser.count({
      where: {
        role: AdminRole.super_admin,
        isActive: true,
        NOT: { id: user.id },
      },
    });

    if (remainingActiveSuperAdmins < 1) {
      throw new BadRequestException('至少需要保留一个启用状态的超级管理员');
    }
  }
}
