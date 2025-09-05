# Vercel Deployment Guide - LVL UP Performance

## Prerequisites
1. ✅ GitHub repository created and code pushed
2. ✅ Vercel account (sign up at vercel.com)
3. ✅ PostgreSQL database (Neon, Supabase, or other)

## Step 1: Database Setup
Before deploying, set up your PostgreSQL database:

### Option A: Neon Database (Recommended)
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string (starts with `postgresql://`)

### Option B: Supabase
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

## Step 2: Deploy to Vercel

### Via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository `LVLREP`
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/public`

### Environment Variables:
Add these in Vercel dashboard → Settings → Environment Variables:

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=generate-a-32-character-random-string
NODE_ENV=production
```

### Optional Variables (add later):
```env
REPLIT_AUTH_ISSUER=https://replit.com
REPLIT_AUTH_CLIENT_ID=your-oauth-client-id
REPLIT_AUTH_CALLBACK_URL=https://your-app.vercel.app/auth/callback
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-mailgun-domain
```

## Step 3: Database Migration
After deployment, run database migration:

1. In Vercel dashboard → Functions tab
2. Or use Vercel CLI:
   ```bash
   npx vercel env pull .env.local
   npm run db:push
   ```

## Step 4: Custom Domain (Optional)
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update callback URLs in auth settings

## Troubleshooting

### Common Issues:
1. **Build fails**: Check build logs in Vercel dashboard
2. **Database connection**: Verify DATABASE_URL is correct
3. **Session issues**: Ensure SESSION_SECRET is set
4. **API routes not working**: Check vercel.json routing

### Logs:
- View function logs in Vercel dashboard → Functions
- Real-time logs: `npx vercel logs`

## Architecture on Vercel:
- **Frontend**: Static files served from CDN
- **Backend**: Serverless functions (Express routes)
- **Database**: External PostgreSQL (Neon/Supabase)
- **Sessions**: Stored in PostgreSQL

## Performance Notes:
- Serverless functions have cold starts (~1-2s first request)
- Database connections are pooled automatically
- Static assets cached globally on CDN
- WebSocket support available with additional config

## Next Steps After Deployment:
1. Test all functionality
2. Set up monitoring
3. Configure custom domain
4. Set up CI/CD for automatic deployments
5. Add environment-specific configurations
