import { Module } from '@nestjs/common';

import { ContactMessageController } from '@/modules/contact-message/contact-message.controller';
import { ContactMessageService } from '@/modules/contact-message/contact-message.service';

@Module({
  controllers: [ContactMessageController],
  providers: [ContactMessageService],
  exports: [ContactMessageService],
})
export class ContactMessageModule {}
