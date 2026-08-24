import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateCommunityCommentDto {
  @IsNotEmpty({ message: '댓글 내용을 입력해주세요.' })
  @MinLength(1, { message: '댓글 내용을 입력해주세요.' })
  @MaxLength(500, { message: '댓글은 500자 이하로 입력해주세요.' })
  content!: string;
}
