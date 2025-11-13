import { IsEmail, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên!' })
  @MinLength(5, { message: 'Họ tên phải có ít nhất 5 ký tự!' })
  @MaxLength(50, { message: 'Họ tên không được vượt quá 50 ký tự!' })
  fullName: string;

  @IsNotEmpty({ message: 'Vui lòng nhập email của bạn!' })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  email: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu!' })
  @MinLength(8, { message: 'Mật khẩu phải chứa ít nhất 8 ký tự!' })
  @Matches(/[A-Z]/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
  })
  @Matches(/[a-z]/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
  })
  @Matches(/\d/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ số!',
  })
  @Matches(/[@$!%*?&]/, {
    message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
  })
  password: string;
}
export class LoginDto {
  @IsNotEmpty({ message: 'Vui lòng nhập email của bạn!' })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  email: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu!' })
  @MinLength(8, { message: 'Mật khẩu phải chứa ít nhất 8 ký tự!' })
  @Matches(/[A-Z]/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
  })
  @Matches(/[a-z]/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
  })
  @Matches(/\d/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ số!',
  })
  @Matches(/[@$!%*?&]/, {
    message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!',
  })
  password: string;
}
