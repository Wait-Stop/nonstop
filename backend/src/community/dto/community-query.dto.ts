import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CommunityQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @IsIn(['home', 'popular'])
  tab?: 'home' | 'popular';

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  pageSize?: string;
}
