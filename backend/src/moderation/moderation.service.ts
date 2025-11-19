import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export enum ModerationStatus {
  SAFE = 'SAFE',
  UNSAFE = 'UNSAFE',
  REVIEW = 'REVIEW',
}

export interface ModerationResult {
  status: ModerationStatus;
  confidence: number;
  flags: string[];
  reason?: string;
}

@Injectable()
export class ModerationService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * Moderate image using Google Vision API SafeSearch
   */
  async moderateImage(imageUrl: string): Promise<ModerationResult> {
    const apiKey = this.configService.get<string>('GOOGLE_VISION_API_KEY');
    
    if (!apiKey) {
      // Fallback: Basic file type check
      return this.basicImageCheck(imageUrl);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
          {
            requests: [
              {
                image: {
                  source: {
                    imageUri: imageUrl,
                  },
                },
                features: [
                  {
                    type: 'SAFE_SEARCH_DETECTION',
                    maxResults: 1,
                  },
                ],
              },
            ],
          },
        ),
      );

      const safeSearch = response.data.responses[0]?.safeSearchAnnotation;
      if (!safeSearch) {
        return {
          status: ModerationStatus.REVIEW,
          confidence: 0.5,
          flags: [],
          reason: 'Unable to analyze image',
        };
      }

      const flags: string[] = [];
      let isUnsafe = false;

      // Check each category
      if (safeSearch.adult === 'LIKELY' || safeSearch.adult === 'VERY_LIKELY') {
        flags.push('adult_content');
        isUnsafe = true;
      }
      if (safeSearch.violence === 'LIKELY' || safeSearch.violence === 'VERY_LIKELY') {
        flags.push('violence');
        isUnsafe = true;
      }
      if (safeSearch.racy === 'LIKELY' || safeSearch.racy === 'VERY_LIKELY') {
        flags.push('racy_content');
        isUnsafe = true;
      }
      if (safeSearch.spoof === 'LIKELY' || safeSearch.spoof === 'VERY_LIKELY') {
        flags.push('spoof');
      }
      if (safeSearch.medical === 'LIKELY' || safeSearch.medical === 'VERY_LIKELY') {
        flags.push('medical');
      }

      return {
        status: isUnsafe ? ModerationStatus.UNSAFE : ModerationStatus.SAFE,
        confidence: 0.9,
        flags,
        reason: isUnsafe
          ? `Image contains inappropriate content: ${flags.join(', ')}`
          : undefined,
      };
    } catch (error) {
      // Fallback on error
      return {
        status: ModerationStatus.REVIEW,
        confidence: 0.3,
        flags: [],
        reason: 'Moderation service unavailable',
      };
    }
  }

  /**
   * Moderate text content (basic keyword filtering)
   */
  async moderateText(text: string): Promise<ModerationResult> {
    const bannedWords = this.getBannedWords();
    const lowerText = text.toLowerCase();

    const foundFlags: string[] = [];
    for (const word of bannedWords) {
      if (lowerText.includes(word.toLowerCase())) {
        foundFlags.push('inappropriate_language');
        break;
      }
    }

    // Check for spam patterns
    if (this.detectSpam(text)) {
      foundFlags.push('spam');
    }

    return {
      status: foundFlags.length > 0 ? ModerationStatus.UNSAFE : ModerationStatus.SAFE,
      confidence: foundFlags.length > 0 ? 0.8 : 0.9,
      flags: foundFlags,
      reason:
        foundFlags.length > 0
          ? 'Text contains inappropriate content or spam'
          : undefined,
    };
  }

  /**
   * Moderate user-generated content (image + text)
   */
  async moderateContent(
    imageUrl?: string,
    text?: string,
  ): Promise<ModerationResult> {
    const results: ModerationResult[] = [];

    if (imageUrl) {
      results.push(await this.moderateImage(imageUrl));
    }

    if (text) {
      results.push(await this.moderateText(text));
    }

    if (results.length === 0) {
      return {
        status: ModerationStatus.SAFE,
        confidence: 1.0,
        flags: [],
      };
    }

    // If any result is unsafe, content is unsafe
    const unsafeResult = results.find((r) => r.status === ModerationStatus.UNSAFE);
    if (unsafeResult) {
      return unsafeResult;
    }

    // If any needs review, mark for review
    const reviewResult = results.find((r) => r.status === ModerationStatus.REVIEW);
    if (reviewResult) {
      return reviewResult;
    }

    // All safe
    return {
      status: ModerationStatus.SAFE,
      confidence: Math.min(...results.map((r) => r.confidence)),
      flags: [],
    };
  }

  private basicImageCheck(imageUrl: string): ModerationResult {
    // Basic check: file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = allowedExtensions.some((ext) =>
      imageUrl.toLowerCase().endsWith(ext),
    );

    return {
      status: hasValidExtension ? ModerationStatus.REVIEW : ModerationStatus.UNSAFE,
      confidence: 0.5,
      flags: hasValidExtension ? [] : ['invalid_file_type'],
      reason: hasValidExtension
        ? 'Manual review required'
        : 'Invalid image file type',
    };
  }

  private getBannedWords(): string[] {
    // In production, load from database or config
    return [
      // Add appropriate banned words list
      // This is a placeholder - should be configurable
    ];
  }

  private detectSpam(text: string): boolean {
    // Basic spam detection
    // Check for excessive links
    const linkCount = (text.match(/http/gi) || []).length;
    if (linkCount > 2) return true;

    // Check for excessive repetition
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
      return true;
    }

    return false;
  }
}

