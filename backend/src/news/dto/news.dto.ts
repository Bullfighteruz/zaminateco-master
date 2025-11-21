import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  mediaURL?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  mediaURL?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

