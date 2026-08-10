import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { EventsModule } from './events/events.module';
import { LocationsModule } from './locations/locations.module';
import { ShopModule } from './shop/shop.module';
import { StoriesModule } from './stories/stories.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { UploadModule } from './upload/upload.module';
import { WasteLogsModule } from './waste-logs/waste-logs.module';
// import { NewsModule } from './news/news.module';
// import { GeoModule } from './geo/geo.module';
// import { ModerationModule } from './moderation/moderation.module';
// import { NotificationsModule } from './notifications/notifications.module';
import { LocalizationModule } from './localization/localization.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    EventsModule,
    LocationsModule,
    ShopModule,
    StoriesModule,
    LeaderboardModule,
    UploadModule,
    WasteLogsModule,
    // NewsModule, // Temporarily disabled - missing NewsContent model
    // GeoModule, // Temporarily disabled - missing @nestjs/axios
    // ModerationModule, // Temporarily disabled - missing @nestjs/axios
    // NotificationsModule, // Temporarily disabled - missing @nestjs/axios
    LocalizationModule,
    AiModule,
  ],
})
export class AppModule {}

