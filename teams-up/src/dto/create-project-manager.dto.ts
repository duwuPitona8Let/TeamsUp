import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProjectManagerDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  accessLevel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projects?: string[];
}
