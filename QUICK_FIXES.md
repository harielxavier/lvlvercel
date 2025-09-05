# Quick Fixes Guide - LVL UP Performance Platform

## 🔥 CRITICAL: Fix These First (30 minutes)

### 1. Remove Exposed Credentials
```bash
# Remove sensitive file from git history
git rm --cached .env.production
git rm --cached .env
echo ".env*" >> .gitignore
git add .gitignore
git commit -m "Remove exposed credentials and update gitignore"

# Rotate database password immediately in Neon dashboard
# Generate new session secret:
openssl rand -base64 32
```

### 2. Fix Duplicate Route (server/routes.ts)
```typescript
// DELETE lines 1177-1223 (duplicate departments route)
// The first implementation at line 927 is sufficient
```

### 3. Add Authentication to Feedback Endpoint
```typescript
// server/routes.ts - Line 869
// CHANGE FROM:
app.post("/api/feedback", async (req, res) => {

// CHANGE TO:
app.post("/api/feedback", isAuthenticated, async (req, res) => {
```

---

## 🚨 TypeScript Fixes (15 minutes)

### Fix 1: Add Types to AdvancedEmployeeManagement.tsx
```typescript
// Line 250, 268, 289, 354
// CHANGE FROM:
.then((data) => {

// CHANGE TO:
.then((data: any) => {  // Or define proper interface
```

### Fix 2: Fix User Type (useSubscriptionTier.ts)
```typescript
// Line 68
// CHANGE FROM:
const { user } = useAuth();

// CHANGE TO:
const { user } = useAuth() as { user: { tenantId?: string } };
```

### Fix 3: Fix React Query v5 (WebsiteCustomization.tsx)
```typescript
// Line 80 - Remove onSuccess
// CHANGE FROM:
const { data: settings } = useQuery({
  queryKey: ['websiteSettings', user?.tenantId],
  queryFn: fetchSettings,
  onSuccess: (data) => setFormData(data), // REMOVE THIS LINE
});

// CHANGE TO:
const { data: settings } = useQuery({
  queryKey: ['websiteSettings', user?.tenantId],
  queryFn: fetchSettings,
});

// Add useEffect to handle success:
useEffect(() => {
  if (settings) {
    setFormData(settings);
  }
}, [settings]);
```

---

## 🧹 Console.log Cleanup (10 minutes)

### Remove All Console Statements
```bash
# Run this command to remove all console.log statements
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' '/console\.(log|error|warn|info)/d'

# Or manually remove from these files:
# - client/src/pages/PublicFeedbackForm.tsx
# - client/src/hooks/useWebSocket.ts (12 instances)
# - client/src/pages/CustomerTenants.tsx (7 instances)
# - client/src/components/ErrorBoundary.tsx (2 instances)
# - client/src/components/CreatePerformanceReviewForm.tsx
```

---

## 🔧 Serverless Function Fix (20 minutes)

### Connect Real Routes to Serverless
```javascript
// api/[...slug].js
// Replace entire file with:
import express from "express";
import dotenv from "dotenv";
import { registerRoutes } from "../server/routes.js";
import { getSession } from "../server/vercelAuth.js";
import passport from "passport";

dotenv.config();

const app = express();

// Add proper middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Session and auth
app.use(getSession());
app.use(passport.initialize());
app.use(passport.session());

// CORS with specific origins
const allowedOrigins = [
  'https://lvlup-performance-public.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Register actual routes
registerRoutes(app);

export default app;
```

---

## 🔒 Security Quick Wins (15 minutes)

### 1. Add Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
// server/routes.ts - Add at top
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests
  message: 'Too many authentication attempts'
});

// Apply to auth routes
app.post('/api/login', authLimiter, ...);
app.post('/api/auth/vercel', authLimiter, ...);
app.post('/api/admin/password-reset', authLimiter, ...);
```

### 2. Add Security Headers
```bash
npm install helmet
```

```javascript
// server/index.ts or api/[...slug].js
import helmet from 'helmet';
app.use(helmet());
```

---

## 📊 Database Optimization (10 minutes)

### Add Missing Indexes
```sql
-- Run these in your Neon database console
CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_feedback_employee ON feedback(employee_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_performance_reviews_tenant ON performance_reviews(tenant_id);
CREATE INDEX idx_goals_employee ON goals(employee_id);
```

---

## 🎯 Testing Commands

### Verify TypeScript Fixes
```bash
npm run check
```

### Test API Endpoints
```bash
# Test health check
curl https://lvlup-performance-public.vercel.app/api/health

# Test auth status
curl https://lvlup-performance-public.vercel.app/api/auth/status

# Test with credentials
curl -X POST https://lvlup-performance-public.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Check for Remaining Console Logs
```bash
grep -r "console\." client/src --include="*.ts" --include="*.tsx"
```

---

## ⏱️ Time Estimate

- Critical Fixes: 30 minutes
- TypeScript Fixes: 15 minutes  
- Console Cleanup: 10 minutes
- Serverless Fix: 20 minutes
- Security Quick Wins: 15 minutes
- Database Optimization: 10 minutes

**Total: ~1.5 hours for essential fixes**

---

## Next Steps After Quick Fixes

1. Deploy and test the fixes
2. Monitor error logs in Vercel dashboard
3. Run full test suite
4. Update environment variables in Vercel
5. Consider implementing remaining medium/long-term fixes from audit report