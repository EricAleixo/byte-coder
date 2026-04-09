import { IsString, MinLength, MaxLength, IsUUID, IsOptional, IsBoolean } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;

  @IsUUID()
  postId!: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  anonymousName?: string;
}