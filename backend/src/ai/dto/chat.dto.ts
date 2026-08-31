import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, IsObject, ValidateNested, IsIn, IsInt, Min } from 'class-validator';
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

export class UserProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  coins?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  school?: string;
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
  @ValidateNested()
  @Type(() => UserProfileDto)
  userInfo?: UserProfileDto;
}
