import { Module } from '@nestjs/common';

import { StrengthItemController } from '@/modules/strength-item/strength-item.controller';
import { StrengthItemService } from '@/modules/strength-item/strength-item.service';

@Module({
  controllers: [StrengthItemController],
  providers: [StrengthItemService],
})
export class StrengthItemModule {}
