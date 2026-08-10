import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

export class ScanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(15 * 1024 * 1024) // 15MB max payload
  imageBase64: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  lang?: string = 'en';

  @IsOptional()
  @IsString()
  @Matches(/^image\/(jpeg|jpg|png|webp|heic|avif)$/i, {
    message: 'Unsupported image MIME type',
  })
  mimeType?: string = 'image/jpeg';
}
