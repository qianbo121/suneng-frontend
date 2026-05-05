import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAdminUserDto {
  @ApiProperty({ example: 'editor01' })
  @IsString()
  @MaxLength(80)
  username!: string;

  @ApiProperty({ example: 'editor123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password!: string;

  @ApiProperty({ enum: AdminRole, example: AdminRole.editor })
  @IsEnum(AdminRole)
  role!: AdminRole;

  @ApiProperty({ required: false, example: true, default: true })
  @IsOptional()
  isActive?: boolean;
}
