import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCourseLessonDto } from './create-course-lesson.dto';
import { CreateCourseOutcomeDto } from './create-course-outcome.dto';
import { CourseResourceDto } from './create-course-resource.dto';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  level!: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  coverImagePublicId?: string;

  // duração total é opcional aqui: se não vier, o service recalcula
  // a partir da soma das lessons (mesma lógica do sumDurations do front)
  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseLessonDto)
  lessons?: CreateCourseLessonDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseResourceDto)
  resources?: CourseResourceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseOutcomeDto)
  outcomes?: CreateCourseOutcomeDto[];
}
