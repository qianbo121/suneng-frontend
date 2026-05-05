import { ApiProperty } from '@nestjs/swagger';

export class UploadResultDto {
  @ApiProperty({ type: [String] })
  urls!: string[];
}
