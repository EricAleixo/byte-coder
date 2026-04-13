import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";

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

  @IsEnum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
  level!: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  coverImagePublicId?: string;
}