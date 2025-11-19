import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum SupportedLanguage {
  UZ = 'UZ',
  RU = 'RU',
  EN = 'EN',
}

@Injectable()
export class LocalizationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get localized content for a post/story
   */
  async getLocalizedContent(
    postId: string,
    language: SupportedLanguage,
  ): Promise<{ title: string; content: string } | null> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) return null;

    // If post is already in requested language, return as-is
    if (post.language === language) {
      return {
        title: post.title,
        content: post.content,
      };
    }

    // Try to find translation
    // In production, you might have a translations table
    // For now, return the original content
    // TODO: Implement translation lookup from database

    return {
      title: post.title,
      content: post.content,
    };
  }

  /**
   * Get localized project title and description
   */
  async getLocalizedProject(
    projectId: string,
    language: SupportedLanguage,
  ): Promise<{ title: string; description: string } | null> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) return null;

    // Projects might have translations stored in metadata
    const metadata = project.metadata as any;
    if (metadata?.translations?.[language]) {
      return {
        title: metadata.translations[language].title || project.title,
        description:
          metadata.translations[language].description || project.description,
      };
    }

    // Fallback to original
    return {
      title: project.title,
      description: project.description,
    };
  }

  /**
   * Get localized event details
   */
  async getLocalizedEvent(
    eventId: string,
    language: SupportedLanguage,
  ): Promise<{ title: string; description: string } | null> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) return null;

    const metadata = event.metadata as any;
    if (metadata?.translations?.[language]) {
      return {
        title: metadata.translations[language].title || event.title,
        description:
          metadata.translations[language].description || event.description,
      };
    }

    return {
      title: event.title,
      description: event.description,
    };
  }

  /**
   * Get localized collection point name
   */
  async getLocalizedCollectionPoint(
    pointId: string,
    language: SupportedLanguage,
  ): Promise<{ name: string; address: string } | null> {
    const point = await this.prisma.collectionPoint.findUnique({
      where: { id: pointId },
    });

    if (!point) return null;

    const metadata = point.metadata as any;
    if (metadata?.translations?.[language]) {
      return {
        name: metadata.translations[language].name || point.name,
        address: metadata.translations[language].address || point.address,
      };
    }

    return {
      name: point.name,
      address: point.address,
    };
  }

  /**
   * Store translations for content
   */
  async storeTranslation(
    contentId: string,
    contentType: 'post' | 'project' | 'event' | 'collection_point',
    language: SupportedLanguage,
    translations: { title?: string; description?: string; content?: string },
  ) {
    let model: any;
    switch (contentType) {
      case 'post':
        model = this.prisma.post;
        break;
      case 'project':
        model = this.prisma.project;
        break;
      case 'event':
        model = this.prisma.event;
        break;
      case 'collection_point':
        model = this.prisma.collectionPoint;
        break;
      default:
        throw new Error('Invalid content type');
    }

    const content = await model.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    const metadata = (content.metadata as any) || {};
    metadata.translations = metadata.translations || {};
    metadata.translations[language] = translations;

    await model.update({
      where: { id: contentId },
      data: {
        metadata,
      },
    });
  }

  /**
   * Get user's preferred language
   */
  async getUserLanguage(userId: string): Promise<SupportedLanguage> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
      },
    });

    if (user?.settings?.languagePreference) {
      return user.settings.languagePreference as SupportedLanguage;
    }

    if (user?.language) {
      return user.language as SupportedLanguage;
    }

    return SupportedLanguage.UZ; // Default to Uzbek
  }

  /**
   * Format date/time according to user's locale
   */
  formatDateTime(date: Date, language: SupportedLanguage): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    const locales: Record<SupportedLanguage, string> = {
      [SupportedLanguage.UZ]: 'uz-UZ',
      [SupportedLanguage.RU]: 'ru-RU',
      [SupportedLanguage.EN]: 'en-US',
    };

    return new Intl.DateTimeFormat(locales[language], options).format(date);
  }

  /**
   * Format number according to locale
   */
  formatNumber(number: number, language: SupportedLanguage): string {
    const locales: Record<SupportedLanguage, string> = {
      [SupportedLanguage.UZ]: 'uz-UZ',
      [SupportedLanguage.RU]: 'ru-RU',
      [SupportedLanguage.EN]: 'en-US',
    };

    return new Intl.NumberFormat(locales[language]).format(number);
  }
}

