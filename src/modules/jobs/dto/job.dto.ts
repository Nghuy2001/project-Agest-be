import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class JobApplyDto {
  @IsNotEmpty({ message: 'Job not found.' })
  @IsString({ message: 'Job ID must be a string.' })
  jobId: string;
  @IsNotEmpty({ message: 'Full name is required.' })
  @IsString({ message: 'Full name must be a string.' })
  @MinLength(5, { message: 'Full name must be at least 5 characters.' })
  @MaxLength(50, { message: 'Full name must not exceed 50 characters.' })
  fullName: string;

  @IsNotEmpty({ message: 'Phone number is required.' })
  @Matches(/^(84|0[3|5|7|8|9])[0-9]{8}$/, { message: 'Phone number format is invalid.' })
  phone: string;
}