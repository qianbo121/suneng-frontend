import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { ContactMessageListQueryDto } from '@/modules/contact-message/dto/contact-message-list-query.dto';
import { CreateContactMessageDto } from '@/modules/contact-message/dto/create-contact-message.dto';
import { UpdateContactMessageStatusDto } from '@/modules/contact-message/dto/update-contact-message-status.dto';
import { ContactMessageService } from '@/modules/contact-message/contact-message.service';

@ApiTags('Contact Message')
@Controller()
export class ContactMessageController {
  constructor(private readonly service: ContactMessageService) {}

  @Post('v1/contact')
  @Public()
  @ApiOperation({ summary: 'Submit contact message' })
  createPublic(@Body() dto: CreateContactMessageDto, @Req() request: Request) {
    const clientKey = request.ip || dto.email || dto.phone || dto.name;
    return this.service.createPublic(dto, clientKey);
  }

  @Get('admin/contact-messages')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get contact message list for admin' })
  getAdminList(@Query() query: ContactMessageListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/contact-messages/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get contact message detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch('admin/contact-messages/:id/read')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Mark contact message as read' })
  markRead(@Param('id', ParseIntPipe) id: number) {
    return this.service.markRead(id);
  }

  @Patch('admin/contact-messages/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update contact message status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContactMessageStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete('admin/contact-messages/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete contact message' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
