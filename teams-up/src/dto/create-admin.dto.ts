import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rights?: string[];

  @IsOptional()
  @IsInt()
  level?: number;
}
