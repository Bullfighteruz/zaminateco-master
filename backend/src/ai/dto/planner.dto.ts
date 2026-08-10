import { IsString, IsNotEmpty, MaxLength, IsObject } from 'class-validator';

export class PlannerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  query: string;

  @IsObject()
  currentStock: {
    plastic: number;
    rubber: number;
    paper: number;
  };
}
