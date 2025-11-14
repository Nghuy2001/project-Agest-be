import { IsEmail, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';

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
