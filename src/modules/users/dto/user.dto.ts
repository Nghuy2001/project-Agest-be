import { IsEmail, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';


export class UpdateProfileDto {
  @IsOptional()
  @MinLength(5, { message: 'Full name must be at least 5 characters long!' })
  @MaxLength(50, { message: 'Full name cannot exceed 50 characters!' })
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email is not valid!' })
  email?: string;

  @IsOptional()
  @Matches(/^\d{10,11}$/, { message: 'Phone number must be 10–11 digits!' })
  phone?: string;

}