import { IsOptional, IsString, Matches } from "class-validator";

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
  @Matches(/^\d{1,9}$/, {
    message: 'salaryMin phải là số nguyên không vượt quá 2_147_483_647',
  })
  salaryMin?: string;

  @IsOptional()
  @Matches(/^\d{1,9}$/, {
    message: 'salaryMax phải là số nguyên không vượt quá 2_147_483_647',
  })
  salaryMax?: string;
}