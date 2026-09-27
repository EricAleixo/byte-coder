import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseResourceDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsIn(['REPO', 'DOC', 'VIDEO', 'ARTICLE'])
  type!: 'REPO' | 'DOC' | 'VIDEO' | 'ARTICLE';
}

export class SaveCourseResourcesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseResourceDto)
  resources!: CourseResourceDto[];
}