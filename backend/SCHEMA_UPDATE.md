# Database Schema Update Summary

## ✅ Updated Schema

The Prisma schema has been updated to match the comprehensive specification. All tables and relationships have been implemented.

## 📊 Schema Overview

### 1. User & Security (6 tables)
- ✅ `User` - Main user accounts
- ✅ `UserProfile` - Extended user profile data (points, coins, level, badges, referral code)
- ✅ `PasswordReset` - Password reset tokens
- ✅ `Session` - User sessions and refresh tokens
- ✅ `Referral` - Referral tracking

### 2. Map & Collection (3 tables)
- ✅ `CollectionPoint` - Collection points with location data
- ✅ `Collection` - User material drop-off records
- ✅ `CollectionPointStats` - Aggregated statistics per point

### 3. Voting & Projects (4 tables)
- ✅ `Project` - Community project proposals
- ✅ `Vote` - User votes on projects (one vote per user per project)
- ✅ `Donation` - Project donations with payment tracking
- ✅ `ProjectUpdate` - Timeline updates for projects

### 4. Events & Actions (3 tables)
- ✅ `Event` - Community events
- ✅ `EventCategory` - Event categories for filtering
- ✅ `EventParticipant` - Event registrations and check-ins

### 5. Shop & Marketplace (5 tables)
- ✅ `ProductCategory` - Product categories
- ✅ `Product` - Shop products with charity support
- ✅ `Order` - User orders
- ✅ `OrderItem` - Order line items
- ✅ `Payment` - Payment transactions (Payme/Click/Stripe)

### 6. Stories, News & Education (4 tables)
- ✅ `PostCategory` - Content categories (story/news/education)
- ✅ `Post` - Stories, news, and educational content
- ✅ `PostReaction` - User reactions (likes, emojis)
- ✅ `PostComment` - Comments on posts

### 7. Rewards & Gamification (3 tables)
- ✅ `Achievement` - Achievement definitions with criteria
- ✅ `UserAchievement` - User-earned achievements
- ✅ `Reward` - Redeemable rewards
- ✅ `Redemption` - Reward redemption records

### 8. Notifications & Settings (2 tables)
- ✅ `Notification` - User notifications
- ✅ `UserSettings` - User preferences and settings

### 9. Administrative & Misc (3 tables)
- ✅ `Community` - Schools, mahallas, organizations
- ✅ `File` - File upload metadata
- ✅ `AuditLog` - Audit trail for moderation

## 🔄 Migration Steps

1. **Backup existing database** (if any)
2. **Generate new Prisma client**:
   ```bash
   npm run prisma:generate
   ```
3. **Create migration**:
   ```bash
   npm run prisma:migrate dev --name comprehensive_schema_update
   ```
4. **Review migration SQL** before applying
5. **Apply migration**:
   ```bash
   npm run prisma:migrate deploy
   ```

## 📝 Key Features

### Multi-language Support
- All user-facing content supports EN, RU, UZ
- Language preference stored in User and UserSettings

### Gamification
- Eco Points and Eco Coins system
- User levels based on points
- Achievement system with JSON criteria
- Reward redemption system

### Referral System
- Unique referral codes per user
- Referral tracking with rewards

### Collection Tracking
- Material drop-offs with photos
- Approval workflow
- Statistics aggregation

### Payment Integration
- Multiple payment providers (Payme, Click, Stripe, Eco Coins)
- Transaction tracking
- Payment status management

### Content Management
- Post categories (story/news/education)
- Reactions and comments
- Multi-language content

## 🔧 Service Updates Needed

Some services may need updates to work with the new schema:

1. **UsersService** - Updated to use UserProfile
2. **ProjectsService** - Already compatible
3. **EventsService** - Already compatible
4. **New Services Needed**:
   - CollectionsService
   - AchievementsService
   - RewardsService
   - NotificationsService
   - CommunitiesService

## 📚 Next Steps

1. Run migrations to update database
2. Update services to use new schema
3. Add new endpoints for:
   - Collection points and collections
   - Achievements and rewards
   - Notifications
   - Communities
4. Update frontend to use new API structure

