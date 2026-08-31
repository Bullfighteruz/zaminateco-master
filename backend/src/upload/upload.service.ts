import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

@Injectable()
export class UploadService {
  private uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('UPLOAD_DEST', './uploads');
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File, resize?: { width: number; height: number }): Promise<string> {
    if (!file || !file.buffer || !Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException('Invalid image buffer provided');
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const filepath = path.join(this.uploadPath, filename);

    try {
      // Protect against image bombs with finite limitInputPixels (50 million pixels ~ 50 MP)
      let image = sharp(file.buffer, {
        limitInputPixels: 50000000,
        failOn: 'error',
      });

      // Verify that the buffer is actually a decodable image
      const metadata = await image.metadata();
      if (!metadata || !metadata.format) {
        throw new BadRequestException('File content is not a valid decodable image');
      }

      if (resize) {
        image = image.resize(resize.width, resize.height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      await image.jpeg({ quality: 85 }).toFile(filepath);

      return `/uploads/${filename}`;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Image processing failed: Invalid or corrupted image content');
    }
  }
}

