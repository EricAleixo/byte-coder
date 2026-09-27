import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateCourseOutcomeDto {
  @IsInt()
  @Min(1)
  order!: number;

  @IsString()
  @IsNotEmpty()
  text!: string;
}
