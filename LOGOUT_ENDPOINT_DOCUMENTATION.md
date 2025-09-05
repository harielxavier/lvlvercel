# Logout Endpoint Documentation

## Overview
The HR Performance Management Platform provides secure logout functionality through the `/api/logout` endpoint. This endpoint properly handles user session termination, clears authentication data, and ensures secure logout from the platform.

## Endpoint Details

### GET /api/logout
Handles user logout by destroying the session and clearing authentication cookies.

#### Request
```http
GET /api/logout HTTP/1.1
Host: lvlup-performance-public.vercel.app
Accept: application/json
```

#### Response
**Success (200 OK)**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

**No Active Session (200 OK)**
```json
{
  "success": true,
  "message": "No active session to logout"
}
```

**Error (500 Internal Server Error)**
```json
{
  "success": false,
  "message": "Error during logout",
  "error": "Error details (development mode only)"
}
```

### POST /api/logout
Alternative REST-compliant logout endpoint with identical functionality.

#### Request
```http
POST /api/logout HTTP/1.1
Host: lvlup-performance-public.vercel.app
Content-Type: application/json
Accept: application/json
```

#### Response
Same as GET endpoint responses.

## Implementation Details

### Session Management
- Uses PostgreSQL-backed session store via `connect-pg-simple`
- Session TTL: 7 days
- Sessions stored in `sessions` table in Neon PostgreSQL database
- Session cookie name: `connect.sid`

### Security Features
1. **Session Destruction**: Completely removes session from database
2. **Cookie Clearing**: Explicitly clears session cookie with proper settings
3. **CORS Support**: Full cross-origin request support with credentials
4. **Secure Cookies**: Uses secure cookies in production (HTTPS only)
5. **HTTP-Only Cookies**: Prevents JavaScript access to session cookies
6. **SameSite Protection**: Set to 'lax' for CSRF protection

### Cookie Configuration
```javascript
{
  httpOnly: true,              // Prevents XSS attacks
  secure: true,                 // HTTPS only in production
  sameSite: 'lax',             // CSRF protection
  path: '/',                   // Cookie available site-wide
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}
```

### CORS Headers
The endpoint includes proper CORS headers for cross-origin requests:
- `Access-Control-Allow-Origin`: Matches request origin or '*'
- `Access-Control-Allow-Methods`: GET, POST, PUT, DELETE, OPTIONS, PATCH
- `Access-Control-Allow-Headers`: Origin, X-Requested-With, Content-Type, Accept, Authorization
- `Access-Control-Allow-Credentials`: true

## Error Handling

### Graceful Error Management
- Returns appropriate HTTP status codes
- Provides clear error messages
- Includes detailed error information in development mode only
- Logs errors server-side for debugging

### Edge Cases Handled
1. **No Active Session**: Returns success with informative message
2. **Session Destruction Failure**: Returns 500 with error details
3. **Database Connection Issues**: Handled gracefully with error response
4. **Invalid Session State**: Properly cleaned up

## Integration with Frontend

### JavaScript/Fetch Example
```javascript
// Logout function
async function logout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'GET',
      credentials: 'include',  // Important for cookie handling
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect to login page or home
      window.location.href = '/login';
    } else {
      console.error('Logout failed:', data.message);
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}
```

### React Example with React Query
```javascript
import { useMutation } from '@tanstack/react-query';

const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Clear local state and redirect
      queryClient.clear();
      window.location.href = '/login';
    }
  });
};
```

## Testing

### Manual Testing
```bash
# Test GET logout
curl -X GET https://lvlup-performance-public.vercel.app/api/logout \
  -H "Accept: application/json"

# Test POST logout
curl -X POST https://lvlup-performance-public.vercel.app/api/logout \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"

# Test CORS preflight
curl -X OPTIONS https://lvlup-performance-public.vercel.app/api/logout \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -I
```

### Expected Test Results
✅ GET /api/logout returns success message
✅ POST /api/logout returns success message
✅ OPTIONS request returns proper CORS headers
✅ Session cookie is cleared after logout
✅ Subsequent authenticated requests fail after logout

## Production URL
- **Main Domain**: https://lvlup-performance-public.vercel.app
- **Logout Endpoint**: https://lvlup-performance-public.vercel.app/api/logout

## Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string for session store
- `SESSION_SECRET`: Secret key for session encryption
- `NODE_ENV`: Set to 'production' for secure cookies

## Database Schema
The sessions table is automatically created by `connect-pg-simple`:
```sql
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");
```

## Monitoring and Logging
- Session creation/destruction is logged server-side
- User ID and session ID are recorded for audit purposes
- Error events are logged with full stack traces in development

## Future Enhancements
1. Add support for refresh tokens
2. Implement logout from all devices functionality
3. Add session activity tracking
4. Implement logout webhook notifications
5. Add rate limiting for logout attempts
6. Support for JWT token revocation

## Support
For issues or questions about the logout functionality, please check:
- Server logs in Vercel dashboard
- Session table in PostgreSQL database
- Browser developer tools for cookie inspection
- Network tab for API response details