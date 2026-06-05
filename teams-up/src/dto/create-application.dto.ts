import { IsInt, IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsInt()
  assignmentId: number;

  @IsNotEmpty()
  @IsString()
  candidateName: string;

  @IsNotEmpty()
  @IsEmail()
  candidateEmail: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;
}
