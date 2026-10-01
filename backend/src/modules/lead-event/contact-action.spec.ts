import { validateSync } from 'class-validator';
import type { Request } from 'express';
import { CreateLeadEventDto } from './dto/create-lead-event.dto';
import { LeadEventService } from './lead-event.service';
import type { PrismaService } from '@/prisma/prisma.service';

describe('contact follow-up event receipt', () => {
  it.each(['success', 'failure', 'requested'])('accepts and passes the %s outcome and original entry to storage', async (result) => {
    const dto = Object.assign(new CreateLeadEventDto(), {
      eventType: 'contact_action',
      pagePath: '/zh/service/installation-after-sales',
      sessionId: 'contact-test-session',
      properties: {
        position: 'after_sales_hotline_wechat',
        contact_purpose: 'after_sales',
        contact_kind: 'wechat',
        contact_action: result === 'requested' ? 'open_qr_original' : 'copy',
        contact_result: result,
      },
    });
    expect(validateSync(dto)).toEqual([]);
    const execute = jest.fn().mockResolvedValue(1);
    const service = new LeadEventService({ $executeRaw: execute } as unknown as PrismaService);
    await expect(service.createPublic(dto, { ip: '127.0.0.1', headers: {} } as Request)).resolves.toEqual({ ok: true });
    expect(execute).toHaveBeenCalledTimes(1);
    const values = execute.mock.calls[0].slice(1);
    expect(values).toContain('contact_action');
    expect(values).toContain('/zh/service/installation-after-sales');
    expect(values).toContain(JSON.stringify(dto.properties));
  });
});
