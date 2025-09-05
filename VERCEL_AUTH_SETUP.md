# Vercel Authentication Integration

This project now supports Vercel OAuth authentication for seamless integration with your Vercel account. This enables MCP (Model Context Protocol) functionality and provides a secure authentication flow.

## 🚀 Features

- **Vercel OAuth Integration**: Sign in with your Vercel account
- **MCP Support**: Ready for Vercel MCP server integration
- **Development Fallback**: Maintains development mode for testing
- **Secure Session Management**: Uses PostgreSQL session store
- **User Management**: Automatic user creation from Vercel profile

## 📋 Prerequisites

1. A Vercel account
2. A Vercel project (optional, but recommended)
3. PostgreSQL database
4. Node.js environment

## ⚙️ Setup Instructions

### 1. Create Vercel OAuth Application

1. Go to [Vercel Integrations Settings](https://vercel.com/account/settings/integrations)
2. Click "Create Integration" or "New Integration"
3. Fill in the integration details:
   - **Name**: Your app name (e.g., "LVL UP Performance")
   - **Description**: Brief description of your app
   - **Homepage URL**: Your app's homepage
   - **Redirect URL**: `http://localhost:5000/api/auth/vercel/callback` (for development)
   - For production: `https://yourdomain.com/api/auth/vercel/callback`

4. Note down your **Client ID** and **Client Secret**

### 2. Environment Variables

Create a `.env` file or update your existing one with:

```bash
# Vercel OAuth Configuration
VERCEL_CLIENT_ID=your_vercel_client_id_here
VERCEL_CLIENT_SECRET=your_vercel_client_secret_here
VERCEL_CALLBACK_URL=http://localhost:5000/api/auth/vercel/callback

# Session Configuration (generate a secure random string)
SESSION_SECRET=your_secure_session_secret_here

# Database Configuration
DATABASE_URL=your_postgresql_database_url

# Development Mode
NODE_ENV=development
```

### 3. Production Environment Variables

For production deployment (Vercel, Railway, etc.):

```bash
VERCEL_CLIENT_ID=your_vercel_client_id
VERCEL_CLIENT_SECRET=your_vercel_client_secret
VERCEL_CALLBACK_URL=https://yourdomain.com/api/auth/vercel/callback
SESSION_SECRET=your_production_session_secret
NODE_ENV=production
```

### 4. Database Setup

Ensure your PostgreSQL database has the `sessions` table for session storage:

```sql
CREATE TABLE "sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");
```

## 🔄 Authentication Flow

### With Vercel OAuth (Production)

1. User visits the app
2. If not authenticated, redirected to `/api/login`
3. User clicks "Sign in with Vercel"
4. Redirected to Vercel OAuth
5. After authorization, user is redirected back to app
6. User profile is created/updated in database
7. Session is established

### Development Mode (Fallback)

When Vercel OAuth credentials are not configured:

1. User visits `/api/login`
2. Sees a user selection interface
3. Can select any existing user for testing
4. Session is established for development

## 🛠️ API Endpoints

### Authentication Endpoints

- `GET /api/auth/vercel` - Initiate Vercel OAuth flow
- `GET /api/auth/vercel/callback` - OAuth callback handler
- `GET /api/auth/user` - Get current user information
- `GET /api/auth/status` - Get authentication system status
- `GET /api/login` - Login page (shows Vercel OAuth or dev options)
- `GET /api/logout` - Logout and clear session
- `POST /api/dev-login` - Development login (when OAuth not configured)

### Status Response

```json
{
  "isAuthenticated": false,
  "hasVercelOAuth": true,
  "isDevelopment": false
}
```

## 🔧 Frontend Integration

The frontend `useAuth` hook now provides additional information:

```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { 
    user, 
    isLoading, 
    isAuthenticated,
    hasVercelOAuth,
    isDevelopment,
    authStatus 
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div>
        {hasVercelOAuth ? (
          <a href="/api/auth/vercel">Sign in with Vercel</a>
        ) : (
          <a href="/api/login">Development Login</a>
        )}
      </div>
    );
  }

  return <div>Welcome, {user.firstName}!</div>;
}
```

## 🔐 Security Features

- **Secure Sessions**: Uses PostgreSQL session store with HTTP-only cookies
- **CSRF Protection**: SameSite cookie attribute
- **Token Management**: Automatic token refresh (when implemented)
- **User Validation**: Email-based user lookup and creation
- **Environment-based Security**: Different configurations for dev/prod

## 🧪 Testing

### Development Testing

1. Start the application: `npm run dev`
2. Visit `http://localhost:5000/api/login`
3. You'll see both Vercel OAuth option (if configured) and development user selection

### Production Testing

1. Ensure all environment variables are set
2. Deploy to your hosting platform
3. Visit your domain
4. Should redirect to Vercel OAuth flow

## 🔍 Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**
   - Ensure `VERCEL_CALLBACK_URL` matches your Vercel integration settings
   - Check that the URL includes the correct protocol (http/https)

2. **Session Issues**
   - Verify `SESSION_SECRET` is set and consistent
   - Check PostgreSQL connection and sessions table

3. **User Creation Fails**
   - Ensure database has proper user table schema
   - Check that `getUserByEmail` method works correctly

4. **Development Mode Not Working**
   - Verify users exist in database for development login
   - Check that `NODE_ENV=development` is set

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=vercel-auth:*
```

## 🚀 MCP Integration

With Vercel authentication set up, you can now:

1. Connect to Vercel MCP at `https://mcp.vercel.com`
2. Use your Vercel access tokens for API calls
3. Access Vercel projects and deployments programmatically
4. Manage Vercel resources through the application

### MCP Server Connection

Your authentication provides the necessary tokens for MCP operations:

```javascript
// Access Vercel API with user's token
const vercelToken = getVercelAccessToken(req);
const response = await makeVercelAPIRequest(req, '/v2/user');
```

## 📚 Additional Resources

- [Vercel OAuth Documentation](https://vercel.com/docs/rest-api#authentication/oauth)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Vercel MCP Documentation](https://vercel.com/docs/mcp/vercel-mcp)
- [Passport.js OAuth2 Strategy](http://www.passportjs.org/packages/passport-oauth2/)

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are correct
3. Check server logs for detailed error messages
4. Ensure your Vercel integration is properly configured
