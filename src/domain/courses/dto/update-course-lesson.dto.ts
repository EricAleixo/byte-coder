import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  IsIn,
} from 'class-validator';

export class UpdateCourseLessonDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn(['youtube'])
  videoProvider?: string;
}