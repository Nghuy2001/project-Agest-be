import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, MaxLength, IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';


export class UpdateCompanyDto {
  @IsOptional()
  @IsString({ message: 'Company name must be a string.' })
  @MaxLength(200, { message: 'Company name must not exceed 200 characters.' })
  companyName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Address must not exceed 255 characters.' })
  address?: string;

  @IsOptional()
  @IsString()
  companyModel?: string;

  @IsOptional()
  @IsString()
  companyEmployees?: string;

  @IsOptional()
  @IsString()
  workingTime?: string;

  @IsOptional()
  @IsString()
  workOvertime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number is invalid!' })
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

}


export class CreateJobDto {
  @IsNotEmpty({ message: 'Job title is required!' })
  title: string;

  @IsNumberString({}, { message: 'Minimum salary must be a number!' })
  salaryMin: string;

  @IsNumberString({}, { message: 'Maximum salary must be a number!' })
  salaryMax: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  workingForm?: string;

  @IsOptional()
  @IsString()
  technologies?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateJobDto extends PartialType(CreateJobDto) { }

export class ChangeStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['approved', 'rejected', 'initial'])
  action: string;

  @IsString()
  @IsNotEmpty()
  id: string;
}