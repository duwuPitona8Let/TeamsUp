import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TeamStatus } from '../entities/team.entity';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}
