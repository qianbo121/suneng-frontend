import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { LEAD_EVENT_TYPES } from '@/modules/lead-event/dto/create-lead-event.dto';

describe('lead event frontend/backend contract', () => {
  it('accepts every lead event literal exposed by the frontend contract', () => {
    const frontendContract = readFileSync(
      resolve(process.cwd(), '../frontend/src/lib/api/lead-events.ts'),
      'utf8',
    );
    const frontendEventTypes = [...frontendContract.matchAll(/^\s*\| '([^']+)'$/gm)].map(
      (match) => match[1],
    );

    expect(frontendEventTypes).toEqual(
      expect.arrayContaining(['page_view', 'engaged_session', 'form_start', 'form_step_complete']),
    );
    expect(
      frontendEventTypes.filter((eventType) => !LEAD_EVENT_TYPES.includes(eventType as never)),
    ).toEqual([]);
  });
});
