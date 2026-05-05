import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResultDto<T> {
  @ApiProperty({ isArray: true })
  items!: T[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}
