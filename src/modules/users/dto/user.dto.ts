import { IsEmail, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Full name is required!' })
  @MinLength(5, { message: 'Full name must be at least 5 characters long!' })
  @MaxLength(50, { message: 'Full name cannot exceed 50 characters!' })
  fullName: string;

  @IsNotEmpty({ message: 'Email is required!' })
  @IsEmail({}, { message: 'Email is not valid!' })
  email: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(8, { message: 'Password must be at least 8 characters long!' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter!' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter!' })
  @Matches(/\d/, { message: 'Password must contain at least one number!' })
  @Matches(/[@$!%*?&]/, { message: 'Password must contain at least one special character!' })
  password: string;
}
export class LoginDto {
  @IsNotEmpty({ message: 'Email is required!' })
  @IsEmail({}, { message: 'Email is not valid!' })
  email: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(8, { message: 'Password must be at least 8 characters long!' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter!' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter!' })
  @Matches(/\d/, { message: 'Password must contain at least one number!' })
  @Matches(/[@$!%*?&]/, { message: 'Password must contain at least one special character!' })
  password: string;
}

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