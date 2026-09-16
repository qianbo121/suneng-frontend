import { Module } from '@nestjs/common';

import { WorkpieceRouterController } from '@/modules/workpiece-router/workpiece-router.controller';
import { WorkpieceRouterService } from '@/modules/workpiece-router/workpiece-router.service';

@Module({
  controllers: [WorkpieceRouterController],
  providers: [WorkpieceRouterService],
  exports: [WorkpieceRouterService],
})
export class WorkpieceRouterModule {}
