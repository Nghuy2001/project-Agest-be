import { BadRequestException } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { CVStatus } from '@prisma/client';
import { IsEmail, IsNotEmpty, MaxLength, IsOptional, IsString, IsNumberString, ValidateIf, IsEnum } from 'class-validator';


export class updateCompanyDto {
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


export class createJobDto {
  @IsNotEmpty({ message: 'Job title is required!' })
  title!: string;

  @IsNumberString({}, { message: 'Minimum salary must be a number!' })
  salaryMin!: string;

  @IsNumberString({}, { message: 'Maximum salary must be a number!' })
  salaryMax!: string;
  @ValidateIf(o => o.salaryMin && o.salaryMax)
  validateSalary() {
    if (parseInt(this.salaryMin) > parseInt(this.salaryMax)) {
      throw new BadRequestException('Minimum salary cannot exceed maximum salary!');
    }
  }
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

export class updateJobDto extends PartialType(createJobDto) { }

export class changeStatusDto {
  @IsEnum(CVStatus)
  action!: CVStatus;

  @IsString()
  @IsNotEmpty()
  id!: string;
}