# LVL UP Performance - Deployment & Setup Guide

This guide contains everything needed to restore, configure, and deploy the LVL UP Performance application from any development environment.

## Project Overview

LVL UP Performance is a next-generation HR performance management and feedback system built as a SaaS platform. It features a Universal Feedback Link System for seamless feedback collection through personalized URLs, QR codes, and various integration methods.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for styling
- **wouter** for client-side routing
- **TanStack Query** for server state management

### Backend
- **Express.js** with TypeScript (ES modules)
- **PostgreSQL** with Drizzle ORM
- **Passport.js** for authentication
- **Replit Auth** (OpenID Connect)
- **Session management** with PostgreSQL storage

## Required Environment Variables

### Critical Production Variables
These variables are **REQUIRED** for production deployment:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Session Security
SESSION_SECRET=your-32-character-minimum-session-secret

# Replit Authentication (REQUIRED for production)
REPLIT_AUTH_ISSUER=https://replit.com
REPLIT_AUTH_CLIENT_ID=your-replit-oauth-client-id
REPLIT_AUTH_CALLBACK_URL=https://your-app-domain.replit.app/auth/callback

# Application Settings
NODE_ENV=production
PORT=5000
```

### Optional Service Variables
```env
# Email Service (Mailgun)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain

# SMS Service (Twilio) - Currently not implemented
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
```

## Replit Auth Configuration

### Step 1: Create Replit OAuth Application
1. Go to Replit's developer console
2. Create a new OAuth application
3. Configure the following settings:
   - **App Name**: LVL UP Performance
   - **Callback URL**: `https://your-app-domain.replit.app/auth/callback`
   - **Scopes**: Required OAuth scopes for user authentication

### Step 2: Obtain Credentials
After creating the OAuth app, you'll receive:
- **Client ID**: Use for `REPLIT_AUTH_CLIENT_ID`
- **Issuer URL**: Typically `https://replit.com` for `REPLIT_AUTH_ISSUER`
- **Callback URL**: Your configured callback for `REPLIT_AUTH_CALLBACK_URL`

### Step 3: Configure Secrets in Replit
In your Replit project:
1. Open the Secrets tab (lock icon in sidebar)
2. Add each environment variable as a secret
3. Values will be automatically available to your deployed application

## Database Setup

### Schema Management
The application uses Drizzle ORM with PostgreSQL. Database schema is defined in:
- `shared/schema.ts` - Main schema definitions
- `server/storage.ts` - Storage interface implementation

### Database Migration Commands
```bash
# Push schema changes to database
npm run db:push

# Force push (if data loss warning appears)
npm run db:push --force

# Generate migration files (not used in this project)
npm run db:generate
```

### Key Database Tables
- `users` - User authentication and profile data
- `tenants` - Multi-tenant organization data
- `employees` - Employee information within tenants
- `goals` - Goal management with priorities, milestones, and progress tracking
- `feedback` - Feedback collection and responses
- `sessions` - User session storage

## Local Development Setup

### Prerequisites
- Node.js 18+ with npm
- PostgreSQL database access
- Git

### Installation Steps
```bash
# Clone the repository
git clone <repository-url>
cd lvl-up-performance

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Development Environment Variables
```env
NODE_ENV=development
DATABASE_URL=your-local-postgres-url
SESSION_SECRET=development-session-secret-32-chars-min
PORT=5000

# Replit Auth (optional in development)
REPLIT_AUTH_ISSUER=https://replit.com
REPLIT_AUTH_CLIENT_ID=your-dev-client-id
REPLIT_AUTH_CALLBACK_URL=http://localhost:5000/auth/callback
```

## Deployment Process

### Pre-Deployment Checklist
- [ ] All environment variables configured in Replit Secrets
- [ ] Database schema up to date (`npm run db:push`)
- [ ] Replit OAuth application created and configured
- [ ] Production callback URL added to OAuth settings

### Deployment Steps
1. **Push code to repository**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Configure Replit deployment**
   - Ensure all secrets are set in Replit
   - Verify the `Start application` workflow is configured
   - Check that the run command is `npm run dev`

3. **Deploy application**
   - Replit will automatically build and deploy
   - Monitor deployment logs for any errors
   - Verify authentication flow works in production

### Common Deployment Issues

#### Authentication Configuration Error
```
Authentication configuration is required in production - missing REPLIT_AUTH_ISSUER, REPLIT_AUTH_CLIENT_ID, or REPLIT_AUTH_CALLBACK_URL secrets
```
**Solution**: Ensure all three Replit Auth environment variables are configured in Replit Secrets.

#### Database Connection Issues
**Solution**: Verify `DATABASE_URL` is correctly set and accessible from Replit's servers.

#### Session Configuration Error
```
SESSION_SECRET environment variable is required in production
```
**Solution**: Set a secure 32+ character `SESSION_SECRET` in Replit Secrets.

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and configurations
│   │   └── App.tsx        # Main app component
├── server/                # Backend Express application
│   ├── config.ts          # Environment configuration
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── replitAuth.ts      # Authentication setup
│   └── index.ts           # Server entry point
├── shared/                # Shared code between client/server
│   └── schema.ts          # Database schema definitions
├── package.json           # Dependencies and scripts
└── vite.config.ts         # Vite configuration
```

## Key Features Implemented

### Authentication System
- Replit OAuth integration with Passport.js
- Session management with PostgreSQL storage
- Multi-tenant user isolation
- Role-based access control

### Goal Management System
- Advanced goal creation with priorities and milestones
- Real-time search and filtering
- Visual progress tracking
- Category-based organization

### Multi-Tenant Architecture
- Tenant isolation at database level
- Subscription tier management
- Role-based permissions
- Data security and privacy

## Troubleshooting

### Development Issues
1. **Port already in use**: Change `PORT` in environment variables
2. **Database connection failed**: Verify `DATABASE_URL` and database accessibility
3. **Authentication not working**: Check Replit Auth configuration and callback URLs

### Production Issues
1. **App crashes on startup**: Check environment variable configuration
2. **Authentication redirect fails**: Verify OAuth callback URL matches deployment domain
3. **Database queries fail**: Ensure database schema is up to date with `npm run db:push`

## Support and Maintenance

### Regular Maintenance Tasks
- Monitor application logs for errors
- Update dependencies regularly (`npm update`)
- Backup database regularly
- Review and rotate authentication secrets

### Performance Monitoring
- Monitor response times and error rates
- Check database query performance
- Monitor memory and CPU usage
- Review user feedback and usage patterns

## Additional Resources

- [Replit Documentation](https://docs.replit.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [React Query Documentation](https://tanstack.com/query/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Last Updated**: September 2025
**Version**: 1.0.0