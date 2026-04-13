import { IsInt, Min } from "class-validator";

export class UpdatePositionDto {
  @IsInt()
  @Min(1)
  position!: number;
}