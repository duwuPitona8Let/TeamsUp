import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rights?: string[];

  @IsOptional()
  @IsInt()
  level?: number;
}
