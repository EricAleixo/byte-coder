import { IsEmail, IsString, MinLength, IsOptional, IsUrl } from 'class-validator';

export class SignUpDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}