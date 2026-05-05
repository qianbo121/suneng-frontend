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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';
import { UpdatePublishStatusDto } from '@/common/dto/update-publish-status.dto';
import { CreatePartnerDto } from '@/modules/partner/dto/create-partner.dto';
import { PartnerListQueryDto } from '@/modules/partner/dto/partner-list-query.dto';
import { UpdatePartnerDto } from '@/modules/partner/dto/update-partner.dto';
import { PartnerService } from '@/modules/partner/partner.service';

@ApiTags('Partner')
@Controller()
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Get('v1/partners')
  @Public()
  @ApiOperation({ summary: 'Get published partners' })
  getPublicList() {
    return this.partnerService.getPublicList();
  }

  @Get('admin/partners')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get partner list for admin' })
  getAdminList(@Query() query: PartnerListQueryDto) {
    return this.partnerService.getAdminList(query);
  }

  @Get('admin/partners/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get partner detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partnerService.findOne(id);
  }

  @Post('admin/partners')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create partner' })
  create(@Body() dto: CreatePartnerDto) {
    return this.partnerService.create(dto);
  }

  @Patch('admin/partners/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update partner' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartnerDto) {
    return this.partnerService.update(id, dto);
  }

  @Patch('admin/partners/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update partner status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.partnerService.updateStatus(id, dto.status);
  }

  @Delete('admin/partners/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete partner' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partnerService.remove(id);
  }
}
