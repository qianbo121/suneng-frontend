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

import { UpdatePublishStatusDto } from '@/common/dto/update-publish-status.dto';
import { AboutService } from '@/modules/about/about.service';
import { AboutSectionListQueryDto } from '@/modules/about/dto/about-section-list-query.dto';
import { ChairmanMessageListQueryDto } from '@/modules/about/dto/chairman-message-list-query.dto';
import { CreateAboutSectionDto } from '@/modules/about/dto/create-about-section.dto';
import { CreateChairmanMessageDto } from '@/modules/about/dto/create-chairman-message.dto';
import { CreateCultureValueDto } from '@/modules/about/dto/create-culture-value.dto';
import { CreateTimelineEventDto } from '@/modules/about/dto/create-timeline-event.dto';
import { CultureValueListQueryDto } from '@/modules/about/dto/culture-value-list-query.dto';
import { TimelineListQueryDto } from '@/modules/about/dto/timeline-list-query.dto';
import { UpdateAboutSectionDto } from '@/modules/about/dto/update-about-section.dto';
import { UpdateChairmanMessageDto } from '@/modules/about/dto/update-chairman-message.dto';
import { UpdateCultureValueDto } from '@/modules/about/dto/update-culture-value.dto';
import { UpdateTimelineEventDto } from '@/modules/about/dto/update-timeline-event.dto';

@ApiTags('About Admin')
@ApiBearerAuth('bearer')
@Roles(AdminRole.super_admin, AdminRole.editor)
@Controller('admin/about')
export class AboutAdminController {
  constructor(private readonly aboutService: AboutService) {}

  @Get('sections')
  @ApiOperation({ summary: 'Get about section list' })
  getSectionList(@Query() query: AboutSectionListQueryDto) {
    return this.aboutService.getSectionList(query);
  }

  @Get('sections/:id')
  @ApiOperation({ summary: 'Get about section detail' })
  findSection(@Param('id', ParseIntPipe) id: number) {
    return this.aboutService.findSection(id);
  }

  @Post('sections')
  @ApiOperation({ summary: 'Create about section' })
  createSection(@Body() dto: CreateAboutSectionDto) {
    return this.aboutService.createSection(dto);
  }

  @Patch('sections/:id')
  @ApiOperation({ summary: 'Update about section' })
  updateSection(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAboutSectionDto) {
    return this.aboutService.updateSection(id, dto);
  }

  @Patch('sections/:id/status')
  @ApiOperation({ summary: 'Update about section status' })
  updateSectionStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.aboutService.updateSectionStatus(id, dto.status);
  }

  @Delete('sections/:id')
  @ApiOperation({ summary: 'Delete about section' })
  removeSection(@Param('id', ParseIntPipe) id: number) {
    return this.aboutService.removeSection(id);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get timeline list' })
  getTimelineList(@Query() query: TimelineListQueryDto) {
    return this.aboutService.getTimelineList(query);
  }

  @Get('timeline/:id')
  @ApiOperation({ summary: 'Get timeline detail' })
  findTimeline(@Param('id', ParseIntPipe) id: number) {
    return this.aboutService.findTimeline(id);
  }

  @Post('timeline')
  @ApiOperation({ summary: 'Create timeline event' })
  createTimeline(@Body() dto: CreateTimelineEventDto) {
    return this.aboutService.createTimeline(dto);
  }

  @Patch('timeline/:id')
  @ApiOperation({ summary: 'Update timeline event' })
  updateTimeline(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTimelineEventDto) {
    return this.aboutService.updateTimeline(id, dto);
  }

  @Patch('timeline/:id/status')
  @ApiOperation({ summary: 'Update timeline event status' })
  updateTimelineStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.aboutService.updateTimelineStatus(id, dto.status);
  }

  @Delete('timeline/:id')
  @ApiOperation({ summary: 'Delete timeline event' })
  removeTimeline(@Param('id', ParseIntPipe) id: number) {
    return this.aboutService.removeTimeline(id);
  }

  @Get('chairman')
  @ApiOperation({ summary: 'Get chairman message list' })
  getChairmanList(@Query() query: ChairmanMessageListQueryDto) {
    return this.aboutService.getChairmanList(query);
  }

  @Get('chairman/:id')
  @ApiOperation({ summary: 'Get chairman message detail' })
  findChairman(@Param('id', ParseIntPipe) id: number) {
    return this.aboutService.findChairman(id);
  }

  @Post('chairman')
  @ApiOperation({ summary: 'Create chairman message' })
  createChairman(@Body() dto: CreateChairmanMessageDto) {
    return this.aboutService.createChairman(dto);
  }

  @Patch('chairman/:id')
  @ApiOperation({ summary: 'Update chairman message' })
  updateChairman(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateChairmanMessageDto) {
    return this.aboutService.updateChairman(id, dto);
  }

  @Patch('chairman/:id/status')
  @ApiOperation({ summary: 'Update chairman message status' })
  updateChairmanStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.aboutService.updateChairmanStatus(id, dto.status);
  }

  @Delete('chairman/:id')
  @ApiOperation({ summary: 'Delete chairman message' })
  removeChairman(@Param('id', ParseIntPipe) id: number) {
    return this.aboutService.removeChairman(id);
  }

  @Get('culture')
  @ApiOperation({ summary: 'Get culture value list' })
  getCultureList(@Query() query: CultureValueListQueryDto) {
    return this.aboutService.getCultureList(query);
  }

  @Get('culture/:id')
  @ApiOperation({ summary: 'Get culture value detail' })
  findCulture(@Param('id', ParseIntPipe) id: number) {
    return this.aboutService.findCulture(id);
  }

  @Post('culture')
  @ApiOperation({ summary: 'Create culture value' })
  createCulture(@Body() dto: CreateCultureValueDto) {
    return this.aboutService.createCulture(dto);
  }

  @Patch('culture/:id')
  @ApiOperation({ summary: 'Update culture value' })
  updateCulture(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCultureValueDto) {
    return this.aboutService.updateCulture(id, dto);
  }

  @Patch('culture/:id/status')
  @ApiOperation({ summary: 'Update culture value status' })
  updateCultureStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePublishStatusDto) {
    return this.aboutService.updateCultureStatus(id, dto.status);
  }

  @Delete('culture/:id')
  @ApiOperation({ summary: 'Delete culture value' })
  removeCulture(@Param('id', ParseIntPipe) id: number) {
    return this.aboutService.removeCulture(id);
  }
}
