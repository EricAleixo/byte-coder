import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min, IsEnum } from 'class-validator';

export class CreateCourseLessonDto {
  @IsInt()
  @Min(1)
  order!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  duration!: number; // segundos

  @IsUrl()
  videoUrl!: string;

  @IsEnum(["YOUTUBE", "VIMEO", "DIRECT"])
  videoProvider!: "YOUTUBE" | "VIMEO" | "DIRECT";
}