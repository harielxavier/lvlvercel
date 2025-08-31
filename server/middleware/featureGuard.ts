import type { Request, Response, NextFunction } from 'express';
import { validateFeatureAccess, type TierFeatures } from '../subscriptionFeatures';

// Middleware to guard API endpoints based on subscription tier features
export function requireFeature(feature: keyof TierFeatures) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const userId = user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ 
          message: "Authentication required",
          errorCode: "AUTHENTICATION_REQUIRED"
        });
      }

      // Get storage from app locals (set during app initialization)
      const storage = (req as any).app.locals.storage;
      if (!storage) {
        return res.status(500).json({ 
          message: "Storage not available",
          errorCode: "STORAGE_ERROR"
        });
      }

      const { allowed, reason, tier } = await validateFeatureAccess(userId, feature, storage);
      
      if (!allowed) {
        return res.status(403).json({
          message: reason || `Feature not available in your subscription tier`,
          errorCode: "FEATURE_NOT_AVAILABLE",
          feature,
          currentTier: tier,
          upgradeRequired: true
        });
      }

      // Feature is allowed, continue to the route handler
      next();
    } catch (error) {
      console.error('[FEATURE_GUARD] Error validating feature access:', error);
      return res.status(500).json({
        message: "Failed to validate feature access",
        errorCode: "FEATURE_VALIDATION_ERROR"
      });
    }
  };
}

// Middleware to add tier information to request object
export async function addTierInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const userId = user?.claims?.sub;
    
    if (userId) {
      const storage = (req as any).app.locals.storage;
      if (storage) {
        const userData = await storage.getUser(userId);
        if (userData?.tenantId) {
          const tenant = await storage.getTenant(userData.tenantId);
          if (tenant) {
            (req as any).tierInfo = {
              tier: tenant.subscriptionTier,
              maxEmployees: tenant.maxEmployees
            };
          }
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('[TIER_INFO] Error adding tier information:', error);
    // Don't fail the request, just continue without tier info
    next();
  }
}

// Helper to check feature access in route handlers
export async function checkFeatureAccess(
  req: Request, 
  feature: keyof TierFeatures
): Promise<{ allowed: boolean; reason?: string; tier?: string }> {
  const user = (req as any).user;
  const userId = user?.claims?.sub;
  
  if (!userId) {
    return { allowed: false, reason: "Authentication required" };
  }

  const storage = (req as any).app.locals.storage;
  if (!storage) {
    return { allowed: false, reason: "Storage not available" };
  }

  return await validateFeatureAccess(userId, feature, storage);
}