import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { ShujuNewsReadershipQueryDto } from './shuju-news-readership-query.dto';

const pipe = new ValidationPipe({ transform: true, whitelist: true });

function parse(query: Record<string, unknown>) {
  return pipe.transform(query, { type: 'query', metatype: ShujuNewsReadershipQueryDto });
}

describe('ShujuNewsReadershipQueryDto', () => {
  it('parses and deduplicates positive article IDs', async () => {
    await expect(parse({ ids: '1,2,1,2147483647' })).resolves.toMatchObject({
      ids: [1, 2, 2147483647],
    });
  });

  it('accepts exactly 100 IDs', async () => {
    const ids = Array.from({ length: 100 }, (_, index) => index + 1);
    await expect(parse({ ids: ids.join(',') })).resolves.toMatchObject({ ids });
  });

  it.each([
    undefined,
    null,
    '',
    ' ',
    '0',
    '-1',
    '1.5',
    '1e2',
    '+1',
    '01',
    '1,,2',
    '1,',
    ',1',
    '1, 2',
    '1,nope',
    '2147483648',
    '99999999999999999999999999999999999999999',
    ['1', '2'],
    [1, 2],
    1,
    { value: '1' },
    Array.from({ length: 101 }, (_, index) => index + 1).join(','),
    Array(101).fill('1').join(','),
  ])('rejects invalid or oversized input %p', async (ids) => {
    await expect(parse({ ids })).rejects.toBeInstanceOf(BadRequestException);
  });
});
