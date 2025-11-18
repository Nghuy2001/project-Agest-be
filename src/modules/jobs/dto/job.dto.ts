import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class JobApplyDto {
  @IsNotEmpty({ message: 'Không tìm thấy công việc này!' })
  @IsString()
  jobId: string;

  @IsNotEmpty({ message: "Vui lòng nhập họ tên!" })
  @IsString()
  @MinLength(5, { message: "Họ tên phải có ít nhất 5 kí tự!" })
  @MaxLength(50, { message: "Họ tên không vượt quá 50 ký tự !" })
  fullName: string;

  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại!' })
  @Matches(/^(84|0[3|5|7|8|9])[0-9]{8}$/, { message: 'Số điện thoại không đúng định dạng!' })
  phone: string;
}