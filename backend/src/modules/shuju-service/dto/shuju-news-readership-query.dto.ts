import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, Max, Min } from 'class-validator';

function parseIds(value: unknown): number[] | undefined {
  if (typeof value !== 'string') return undefined;
  const parts = value.split(',');
  if (parts.length > 100 || parts.some((part) => !/^[1-9]\d*$/.test(part))) return undefined;
  return [...new Set(parts.map(Number))];
}

export class ShujuNewsReadershipQueryDto {
  @ApiProperty({ type: String, example: '1,2', description: 'Up to 100 positive news IDs' })
  @Transform(({ value }) => parseIds(value))
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  ids!: number[];
}
