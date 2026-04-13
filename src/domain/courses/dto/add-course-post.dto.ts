import { IsUUID, IsInt, Min } from "class-validator";

export class AddCoursePostDto {
  @IsUUID()
  postId!: string;

  @IsInt()
  @Min(1)
  position!: number;
}