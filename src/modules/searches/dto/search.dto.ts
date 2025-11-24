import { IsOptional, IsString } from "class-validator";

export class SearchJobDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  workingForm?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
  @IsOptional()
  @IsString()
  salaryMin?: string;
  @IsOptional()
  @IsString()
  salaryMax?: string;
}