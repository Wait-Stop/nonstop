import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name: string) {
    // 1. 이미 가입된 이메일인지 확인
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    // 2. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Users 테이블에 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // 4. 비밀번호는 응답으로 보내지 않음
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async login(email: string, password: string) {
    // 1. 이메일로 사용자 찾기
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    // 2. 사용자가 없으면 로그인 실패
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 3. 입력한 비밀번호와 DB의 암호화된 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, user.password ?? '');

    // 4. 비밀번호가 틀리면 로그인 실패
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 5. JWT 발급
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    // 6. 로그인 성공
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
