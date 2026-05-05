import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'admin123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  currentPassword!: string;

  @ApiProperty({ example: 'newAdmin123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  newPassword!: string;
}
