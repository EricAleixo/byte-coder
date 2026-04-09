import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum, IsUrl } from 'class-validator';

export enum UserRole {
  BASIC = 'BASIC',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  avatarPublicId?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole; // opcional porque no banco já tem default BASIC
}