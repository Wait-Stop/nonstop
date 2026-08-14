import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name!: string;
}