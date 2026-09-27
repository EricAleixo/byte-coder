import { IsString, IsNotEmpty, IsUrl, IsEnum } from 'class-validator';

export class CreateCourseLessonResourceDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsUrl()
  url!: string;

  @IsEnum(['REPO', 'DOC', 'VIDEO', 'ARTICLE'])
  type!: 'REPO' | 'DOC' | 'VIDEO' | 'ARTICLE';
}