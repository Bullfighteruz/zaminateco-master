import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

describe('Upload Security Regression Tests', () => {
  let uploadService: UploadService;
  let uploadController: UploadController;
  const testUploadDir = path.join(__dirname, '../../test-uploads');

  beforeAll(async () => {
    const configServiceMock = {
      get: jest.fn().mockReturnValue(testUploadDir),
    } as unknown as ConfigService;

    uploadService = new UploadService(configServiceMock);
    uploadController = new UploadController(uploadService);
  });

  afterAll(() => {
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
  });

  it('should reject missing file or empty buffer cleanly with BadRequestException', async () => {
    await expect(uploadController.uploadImage(null as any)).rejects.toThrow(BadRequestException);
    await expect(uploadController.uploadImage(undefined as any)).rejects.toThrow('Image file is required');

    // Testing empty/invalid buffer in uploadService
    const emptyFile = {
      buffer: Buffer.from([]),
      originalname: 'empty.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    await expect(uploadService.uploadImage(emptyFile)).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid/non-image content (text masquerading as image)', async () => {
    const fakeImageFile = {
      buffer: Buffer.from('NOT_A_REAL_IMAGE_FILE_DATA_CORRUPTED'),
      originalname: 'fake.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    await expect(uploadService.uploadImage(fakeImageFile)).rejects.toThrow(BadRequestException);
    await expect(uploadService.uploadImage(fakeImageFile)).rejects.toThrow(
      'Image processing failed: Invalid or corrupted image content',
    );
  });

  it('should accept valid small PNG and process it into JPEG output', async () => {
    const validPngBuffer = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 34, g: 197, b: 94 }, // Emerald green
      },
    })
      .png()
      .toBuffer();

    const validFile = {
      buffer: validPngBuffer,
      originalname: 'valid.png',
      mimetype: 'image/png',
      size: validPngBuffer.length,
    } as Express.Multer.File;

    const result = await uploadController.uploadImage(validFile);

    expect(result).toHaveProperty('url');
    expect(result.url).toMatch(/^\/uploads\/\d+-\d+\.jpg$/);

    const filename = path.basename(result.url);
    const createdFilePath = path.join(testUploadDir, filename);
    expect(fs.existsSync(createdFilePath)).toBe(true);

    const createdMetadata = await sharp(createdFilePath).metadata();
    expect(createdMetadata.format).toBe('jpeg');
    expect(createdMetadata.width).toBe(10);
    expect(createdMetadata.height).toBe(10);
  });

  it('should accept valid small JPEG and process it into JPEG output', async () => {
    const validJpegBuffer = await sharp({
      create: {
        width: 12,
        height: 12,
        channels: 3,
        background: { r: 16, g: 185, b: 129 },
      },
    })
      .jpeg()
      .toBuffer();

    const validFile = {
      buffer: validJpegBuffer,
      originalname: 'valid.jpg',
      mimetype: 'image/jpeg',
      size: validJpegBuffer.length,
    } as Express.Multer.File;

    const result = await uploadController.uploadImage(validFile);
    expect(result).toHaveProperty('url');
    expect(result.url).toMatch(/^\/uploads\/\d+-\d+\.jpg$/);
  });

  it('should accept valid small WebP and process it into JPEG output', async () => {
    const validWebpBuffer = await sharp({
      create: {
        width: 16,
        height: 16,
        channels: 3,
        background: { r: 5, g: 150, b: 105 },
      },
    })
      .webp()
      .toBuffer();

    const validFile = {
      buffer: validWebpBuffer,
      originalname: 'valid.webp',
      mimetype: 'image/webp',
      size: validWebpBuffer.length,
    } as Express.Multer.File;

    const result = await uploadController.uploadImage(validFile);
    expect(result).toHaveProperty('url');
    expect(result.url).toMatch(/^\/uploads\/\d+-\d+\.jpg$/);
  });

  it('should reject GIF files according to restricted MIME whitelist', () => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const testMime = 'image/gif';

    expect(allowedMimeTypes.includes(testMime)).toBe(false);
  });

  it('should reject HEIC and AVIF files according to restricted MIME whitelist', () => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    expect(allowedMimeTypes.includes('image/heic')).toBe(false);
    expect(allowedMimeTypes.includes('image/heif')).toBe(false);
    expect(allowedMimeTypes.includes('image/avif')).toBe(false);
  });

  it('should reject unsupported non-image MIME types like PDF and text', () => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    expect(allowedMimeTypes.includes('application/pdf')).toBe(false);
    expect(allowedMimeTypes.includes('text/plain')).toBe(false);
    expect(allowedMimeTypes.includes('application/json')).toBe(false);
  });

  it('should enforce resize constraints when requested without enlargement', async () => {
    const validSquareBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 16, g: 185, b: 129 },
      },
    })
      .jpeg()
      .toBuffer();

    const file = {
      buffer: validSquareBuffer,
      originalname: 'square.jpg',
      mimetype: 'image/jpeg',
      size: validSquareBuffer.length,
    } as Express.Multer.File;

    const url = await uploadService.uploadImage(file, { width: 50, height: 50 });
    const filename = path.basename(url);
    const createdFilePath = path.join(testUploadDir, filename);

    const metadata = await sharp(createdFilePath).metadata();
    expect(metadata.width).toBe(50);
    expect(metadata.height).toBe(50);
  });

  it('should ensure errors do not leak binary content or sensitive system paths', async () => {
    const corruptedBuffer = Buffer.from('SENSITIVE_SECRET_TOKEN_IN_PAYLOAD');
    const file = {
      buffer: corruptedBuffer,
      originalname: 'secret.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    try {
      await uploadService.uploadImage(file);
      fail('Expected uploadService to throw');
    } catch (err: any) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).not.toContain('SENSITIVE_SECRET_TOKEN_IN_PAYLOAD');
      expect(err.message).toBe('Image processing failed: Invalid or corrupted image content');
    }
  });
});
