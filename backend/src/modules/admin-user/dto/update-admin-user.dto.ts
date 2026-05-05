import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminUserDto {
  @ApiPropertyOptional({ example: 'editor02' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  username?: string;

  @ApiPropertyOptional({ enum: AdminRole, example: AdminRole.editor })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
