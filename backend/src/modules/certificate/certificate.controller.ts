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
import { AdminRole } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';

import { Public } from '@/common/decorators/public.decorator';
import { UpdatePublishStatusDto } from '@/common/dto/update-publish-status.dto';
import { CertificateListQueryDto } from '@/modules/certificate/dto/certificate-list-query.dto';
import { CreateCertificateDto } from '@/modules/certificate/dto/create-certificate.dto';
import { PublicCertificateQueryDto } from '@/modules/certificate/dto/public-certificate-query.dto';
import { UpdateCertificateDto } from '@/modules/certificate/dto/update-certificate.dto';
import { CertificateService } from '@/modules/certificate/certificate.service';

@ApiTags('Certificate')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller()
export class CertificateController {
  constructor(private readonly service: CertificateService) {}

  @Get('v1/certificates')
  @Public()
  @ApiOperation({ summary: 'Get published certificates' })
  getPublicList(@Query() query: PublicCertificateQueryDto) {
    return this.service.getPublicList(query);
  }

  @Get('admin/certificates')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get certificate list for admin' })
  getAdminList(@Query() query: CertificateListQueryDto) {
    return this.service.getAdminList(query);
  }

  @Get('admin/certificates/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get certificate detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('admin/certificates')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create certificate' })
  create(@Body() dto: CreateCertificateDto) {
    return this.service.create(dto);
  }

  @Patch('admin/certificates/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update certificate' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCertificateDto) {
    return this.service.update(id, dto);
  }

  @Patch('admin/certificates/:id/status')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update certificate status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete('admin/certificates/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete certificate' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
