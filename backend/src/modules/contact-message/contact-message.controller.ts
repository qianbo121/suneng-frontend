import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';

import { Roles } from '@/common/decorators/roles.decorator';
import { ContactMessageService } from '@/modules/contact-message/contact-message.service';
import { ContactMessageListQueryDto } from '@/modules/contact-message/dto/contact-message-list-query.dto';

@ApiTags('Contact Message')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller()
export class ContactMessageController {
  constructor(private readonly service: ContactMessageService) {}

  @Get('admin/contact-messages')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get contact message list for admin' })
  getAdminList(@Query() query: ContactMessageListQueryDto) {
    return this.service.getAdminList(query);
  }
}
