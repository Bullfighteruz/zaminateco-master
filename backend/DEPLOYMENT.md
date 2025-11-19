# Zaminat Backend Deployment Guide

## Quick Start

### 1. Local Development Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Set up database
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run start:dev
```

### 2. Production Build

```bash
# Build
npm run build

# Start production server
npm run start:prod
```

### 3. Docker Deployment

```bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## Cloud Deployment Options

### Railway

1. Connect your GitHub repository
2. Railway will auto-detect NestJS
3. Add PostgreSQL service
4. Set environment variables
5. Deploy!

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Configure serverless functions
4. Add PostgreSQL database
5. Set environment variables

### Google Cloud Run

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/zaminat-backend

# Deploy
gcloud run deploy zaminat-backend \
  --image gcr.io/PROJECT_ID/zaminat-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### AWS Elastic Beanstalk

1. Install EB CLI
2. Initialize: `eb init`
3. Create environment: `eb create zaminat-env`
4. Deploy: `eb deploy`

## Environment Variables

Required for production:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random secret
- `JWT_REFRESH_SECRET`: Different strong random secret
- `NODE_ENV`: `production`
- `PORT`: Server port (usually 3000)
- `CORS_ORIGIN`: Frontend URL(s)

Optional:
- `TWILIO_ACCOUNT_SID`: For SMS OTP
- `GOOGLE_CLIENT_ID`: For Google OAuth
- `SMTP_HOST`: For email notifications

## Database Migrations

```bash
# Create migration
npm run prisma:migrate dev --name migration_name

# Apply migrations in production
npm run prisma:migrate deploy
```

## Monitoring

- Health check endpoint: `GET /api/v1/health`
- API docs: `GET /api/docs`
- Logs: Use cloud provider's logging service

## Backup Strategy

1. **Database Backups**: Daily automated backups via cloud provider
2. **File Uploads**: Store in cloud storage (S3, GCS, Azure Blob)
3. **Environment Variables**: Store securely in cloud provider secrets manager

## Scaling

- **Horizontal**: Use load balancer with multiple instances
- **Database**: Use connection pooling (PgBouncer)
- **Caching**: Add Redis for session storage and caching
- **CDN**: Use CloudFlare or similar for static assets

