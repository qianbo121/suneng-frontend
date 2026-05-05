import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRole, Prisma } from '@prisma/client';
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

  async update(id: number, updateDto: UpdateAdminUserDto) {
    await this.ensureExists(id);

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

  async toggle(id: number) {
    const user = await this.ensureExists(id);

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
}
