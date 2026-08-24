import { IsIn, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export const COMMUNITY_CATEGORIES = [
  '정착후기',
  '질문',
  '지역정보',
  '정책정보',
  '모임',
  '자유게시판',
] as const;

export class CreateCommunityPostDto {
  @IsIn(COMMUNITY_CATEGORIES, {
    message: '지원하지 않는 커뮤니티 게시판입니다.',
  })
  category!: string;

  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @MinLength(2, { message: '제목은 2자 이상이어야 합니다.' })
  @MaxLength(80, { message: '제목은 80자 이하로 입력해주세요.' })
  title!: string;

  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  @MinLength(5, { message: '내용은 5자 이상이어야 합니다.' })
  @MaxLength(3000, { message: '내용은 3000자 이하로 입력해주세요.' })
  content!: string;
}
