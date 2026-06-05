import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsBoolean()
  isVacant?: boolean;
}
