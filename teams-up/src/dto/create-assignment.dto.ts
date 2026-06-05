import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsOptional()
  @IsInt()
  userId?: number | null;

  @IsNotEmpty()
  @IsInt()
  teamId: number;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsOptional()
  @IsBoolean()
  isVacant?: boolean;
}
