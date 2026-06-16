import { BadRequestException } from '@nestjs/common';
import { AdminRole } from '@prisma/client';

import { AdminUserService } from '@/modules/admin-user/admin-user.service';
import { PrismaService } from '@/prisma/prisma.service';

type AdminUserMock = {
  id: number;
  username: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaMock = {
  adminUser: {
    findUnique: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
  };
};

const activeSuperAdmin: AdminUserMock = {
  id: 1,
  username: 'admin',
  passwordHash: 'hash',
  role: AdminRole.super_admin,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function makeService(user: AdminUserMock, remainingActiveSuperAdmins = 0) {
  const prisma: PrismaMock = {
    adminUser: {
      findUnique: jest.fn().mockResolvedValue(user),
      count: jest.fn().mockResolvedValue(remainingActiveSuperAdmins),
      update: jest.fn().mockResolvedValue(user),
    },
  };

  return {
    prisma,
    service: new AdminUserService(prisma as unknown as PrismaService),
  };
}

describe('AdminUserService super admin safeguards', () => {
  it('rejects downgrading the current super admin account', async () => {
    const { prisma, service } = makeService(activeSuperAdmin, 1);

    await expect(service.update(1, { role: AdminRole.editor }, 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.adminUser.update).not.toHaveBeenCalled();
  });

  it('rejects disabling the last active super admin account', async () => {
    const { prisma, service } = makeService(activeSuperAdmin, 0);

    await expect(service.toggle(1, 2)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.adminUser.count).toHaveBeenCalledWith({
      where: {
        role: AdminRole.super_admin,
        isActive: true,
        NOT: { id: 1 },
      },
    });
    expect(prisma.adminUser.update).not.toHaveBeenCalled();
  });

  it('allows disabling a super admin when another active super admin remains', async () => {
    const { prisma, service } = makeService(activeSuperAdmin, 1);

    await service.toggle(1, 2);

    expect(prisma.adminUser.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isActive: false },
      select: expect.any(Object),
    });
  });
});
