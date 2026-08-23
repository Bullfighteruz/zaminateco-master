import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, IsObject, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatPartDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class ChatHistoryItemDto {
  @IsString()
  @IsIn(['user', 'model', 'assistant', 'system'])
  role: 'user' | 'model' | 'assistant' | 'system';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatPartDto)
  parts?: ChatPartDto[];

  @IsOptional()
  @IsString()
  content?: string;
}

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
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];

  @IsOptional()
  @IsObject()
  userInfo?: Record<string, any>;
}
