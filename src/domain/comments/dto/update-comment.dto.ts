import { IsString, MinLength, MaxLength, IsOptional, IsBoolean } from "class-validator";

export class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  anonymousName?: string;
}