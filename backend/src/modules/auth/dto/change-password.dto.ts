import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'your-current-password' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  currentPassword!: string;

  @ApiProperty({ example: 'your-new-strong-password' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  newPassword!: string;
}
