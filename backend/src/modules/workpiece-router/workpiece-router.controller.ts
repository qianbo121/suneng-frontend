import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/decorators/public.decorator';
import { ResolveWorkpieceRouterDto } from '@/modules/workpiece-router/dto/resolve-workpiece-router.dto';
import { WorkpieceRouterService } from '@/modules/workpiece-router/workpiece-router.service';

@ApiTags('Workpiece Router')
@Controller('workpiece-router')
export class WorkpieceRouterController {
  constructor(private readonly service: WorkpieceRouterService) {}

  @Get('examples/:workpieceId')
  @Public()
  @ApiOperation({
    summary: 'List approved public direction examples for one workpiece',
  })
  examples(@Param('workpieceId') workpieceId: string) {
    return this.service.examples(workpieceId);
  }

  @Post('resolve')
  @Public()
  @ApiOperation({
    summary: 'Resolve public workpiece conditions without trusting client inference',
  })
  resolve(@Body() dto: ResolveWorkpieceRouterDto) {
    return this.service.resolve(dto);
  }
}
