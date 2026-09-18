import { Controller, Get, HttpStatus, Logger, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import { INQUIRY_CONTRACT_VERSION } from '@/modules/custom-requirement/inquiry-contract';
import { PrismaService } from '@/prisma/prisma.service';

// The container health check calls this. A process that is up but cannot reach its
// database must not report healthy: the site would keep accepting inquiries it
// cannot store. The probe is a single cheap query with its own timeout.
const DATABASE_PROBE_TIMEOUT_MS = 2000;

@ApiTags('system')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  async getHealth(@Res({ passthrough: true }) response: Response) {
    const database = await this.probeDatabase();
    if (!database) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return {
      service: 'backend',
      status: database ? 'ok' : 'degraded',
      database: database ? 'up' : 'down',
      inquiryContractVersion: INQUIRY_CONTRACT_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  private async probeDatabase() {
    let timer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error('database probe timed out')), DATABASE_PROBE_TIMEOUT_MS);
        }),
      ]);
      return true;
    } catch (error) {
      this.logger.error(`health probe failed: ${error instanceof Error ? error.name : 'unknown error'}`);
      return false;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
