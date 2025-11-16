import { IsEmail, IsNotEmpty, MaxLength, MinLength, Matches, IsOptional, IsString, IsInt, Min, IsArray, IsNumberString } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Vui lòng nhập tên công ty!' })
  @MaxLength(200, { message: 'Tên công ty không được vượt quá 200 ký tự!' })
  companyName: string;

  @IsNotEmpty({ message: 'Vui lòng nhập email!' })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  email: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu!' })
  @MinLength(8, { message: 'Mật khẩu phải chứa ít nhất 8 ký tự!' })
  @Matches(/[A-Z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!' })
  @Matches(/[a-z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái thường!' })
  @Matches(/\d/, { message: 'Mật khẩu phải chứa ít nhất một chữ số!' })
  @Matches(/[@$!%*?&]/, { message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!' })
  password: string;
}

export class LoginDto {
  @IsNotEmpty({ message: "Vui lòng nhập email!" })
  @IsEmail({}, { message: "Email không đúng định dạng!" })
  email: string;

  @IsNotEmpty({ message: "Vui lòng nhập mật khẩu!" })
  @MinLength(8, { message: "Mật khẩu phải chứa ít nhất 8 ký tự!" })
  @Matches(/[A-Z]/, {
    message: "Mật khẩu phải chứa ít nhất một chữ cái in hoa!",
  })
  @Matches(/[a-z]/, {
    message: "Mật khẩu phải chứa ít nhất một chữ cái thường!",
  })
  @Matches(/\d/, {
    message: "Mật khẩu phải chứa ít nhất một chữ số!",
  })
  @Matches(/[@$!%*?&]/, {
    message: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!",
  })
  password: string;
}


export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Tên công ty không được vượt quá 200 ký tự!' })
  companyName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  email?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Địa chỉ quá dài!' })
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
  @MaxLength(20, { message: 'Số điện thoại không hợp lệ!' })
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

}


export class CreateJobDto {
  @IsNotEmpty({ message: "Vui lòng nhập tên công việc!" })
  title: string;

  @IsNumberString({}, { message: "Mức lương tối thiểu không hợp lệ!" })
  salaryMin: string;

  @IsNumberString({}, { message: "Mức lương tối đa không hợp lệ!" })
  salaryMax: string;

  @IsOptional()
  position?: string;

  @IsOptional()
  workingForm?: string;

  @IsOptional()
  technologies?: string;

  @IsOptional()
  description?: string;
}

