import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateProjectManagerDto {
  @IsOptional()
  @IsString()
  accessLevel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projects?: string[];
}
