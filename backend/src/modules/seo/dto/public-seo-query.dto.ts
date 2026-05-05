import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class PublicSeoQueryDto {
  @ApiProperty({ example: 'home' })
  @IsString()
  @MaxLength(180)
  pageKey!: string;
}
