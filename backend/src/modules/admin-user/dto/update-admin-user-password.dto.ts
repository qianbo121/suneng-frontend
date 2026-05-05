import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAdminUserPasswordDto {
  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password!: string;
}
