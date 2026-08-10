import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, IsObject } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  lang?: string = 'uz';

  @IsOptional()
  @IsArray()
  history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;

  @IsOptional()
  @IsObject()
  userInfo?: Record<string, any>;
}
