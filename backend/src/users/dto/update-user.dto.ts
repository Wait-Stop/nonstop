import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  currentRegion?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsString()
  job?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsString()
  rent?: string;

  @IsOptional()
  @IsString()
  deposit?: string;

  @IsOptional()
  @IsString()
  transport?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredRegions?: string[];

  @IsOptional()
  @IsBoolean()
  recommendRegion?: boolean;
}