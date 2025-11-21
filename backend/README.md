# Zaminat.eco Backend API

Backend API for the Zaminat.eco ecological movement platform built with NestJS, TypeScript, PostgreSQL, and Prisma.

## Features

- 🔐 **Authentication**: JWT-based auth with email/password, OAuth (Google, Apple), and SMS OTP
- 👥 **User Management**: Profiles, points, levels, badges, leaderboard
- 🗳️ **Voting System**: Democratic project voting with real-time updates
- 📍 **Location Management**: Action locations and collection points with map integration
- 🎉 **Events**: Community events with participant management
- 🛒 **Eco Shop**: Product catalog with eco-coin payment option
- 📰 **Stories**: News and success stories
- 🏆 **Leaderboard**: User rankings and achievements

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT, Passport.js
- **Documentation**: Swagger/OpenAPI
- **SMS**: Twilio
- **File Upload**: Multer + Sharp

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL 14+
- Twilio account (for SMS OTP)

## Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up database:**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

4. **Start development server:**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`
API Documentation: `http://localhost:3000/api/docs`

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `TWILIO_ACCOUNT_SID`: Twilio account SID for SMS
- `GOOGLE_CLIENT_ID`: Google OAuth client ID

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/verify-otp` - Verify SMS OTP
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Projects
- `GET /api/v1/projects` - Get all projects
- `GET /api/v1/projects/:id` - Get project details
- `POST /api/v1/projects/:id/vote` - Vote for project
- `POST /api/v1/projects/:id/donate` - Donate to project

### Users
- `GET /api/v1/users/me` - Get user profile
- `PUT /api/v1/users/me` - Update user profile

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models:

- **User**: User accounts with roles, points, levels
- **Project**: Voting projects with funding goals
- **Vote**: User votes on projects
- **Donation**: Project donations
- **Event**: Community events
- **ActionLocation**: Collection points and locations
- **Product**: Eco shop products
- **Story**: News and stories
- **Badge**: User achievements
- **Leaderboard**: User rankings

## Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Docker (Recommended)

```bash
docker-compose up -d
```

### Cloud Deployment

The backend is designed to deploy on:
- **GCP**: Cloud Run, App Engine
- **AWS**: Elastic Beanstalk, ECS, Lambda
- **Azure**: App Service
- **Vercel**: Serverless Functions
- **Railway**: Direct deployment

## Security

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting with Throttler
- CORS configuration
- Helmet for security headers
- Input validation with class-validator

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

MIT

