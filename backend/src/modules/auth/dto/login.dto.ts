import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  username!: string;

  @ApiProperty({ example: 'admin123456' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  password!: string;
}
