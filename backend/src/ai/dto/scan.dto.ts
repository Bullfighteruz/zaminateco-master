import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

export class ScanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2500000, {
    message: 'imageBase64 payload exceeds max allowed limit (2.5M Base64 characters / ~1.8MB binary)',
  })
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
