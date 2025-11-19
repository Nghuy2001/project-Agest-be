import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, MaxLength, MinLength, Matches, IsOptional, IsString, IsInt, Min, IsArray, IsNumberString, IsIn } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Company name is required.' })
  @MaxLength(200, { message: 'Company name must not exceed 200 characters.' })
  companyName: string;

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(8, { message: 'Password must be at least 8 characters!' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter!' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter!' })
  @Matches(/\d/, { message: 'Password must contain at least one number!' })
  @Matches(/[@$!%*?&]/, { message: 'Password must contain at least one special character!' })
  password: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(8, { message: 'Password must be at least 8 characters!' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter!' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter!' })
  @Matches(/\d/, { message: 'Password must contain at least one number!' })
  @Matches(/[@$!%*?&]/, { message: 'Password must contain at least one special character!' })
  password: string;
}


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