import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email!: string;

  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password!: string;
}