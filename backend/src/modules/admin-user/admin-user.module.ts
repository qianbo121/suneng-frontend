import { Module } from '@nestjs/common';

import { AdminUserController } from '@/modules/admin-user/admin-user.controller';
import { AdminUserService } from '@/modules/admin-user/admin-user.service';

@Module({
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
