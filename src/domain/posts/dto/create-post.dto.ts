import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  IsEnum,
  IsUrl,
} from "class-validator";

export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  excerpt!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  coverImagePublicId?: string;

  @IsOptional()
  @IsString()
  readTime?: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  tagIds?: string[];

  @IsOptional()
  @IsArray()
  contentImages?: { url: string; publicId: string }[];

  @IsOptional()
  @IsArray()
  links?: PostLinkDto[]
}

class PostLinkDto {
  @IsString()
  label!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  type?: "github" | "docs" | "video" | "book" | "other";

  @IsOptional()
  @IsArray()
  links?: PostLinkDto[];
}