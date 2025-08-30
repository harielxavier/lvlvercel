import { z } from "zod";
import { Response } from "express";

// UUID validation schema
export const uuidSchema = z.string().uuid("Invalid UUID format");

// Common validation functions
export function validateUUID(id: string): boolean {
  try {
    uuidSchema.parse(id);
    return true;
  } catch {
    return false;
  }
}

export function validateUUIDs(ids: string[]): boolean {
  return ids.every(id => validateUUID(id));
}

// Request body validation middleware
export function validateBody(schema: z.ZodSchema) {
  return (req: any, res: Response, next: any) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'Request validation failed',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      
      // Replace request body with validated and sanitized data
      req.body = result.data;
      next();
    } catch (error) {
      console.error('[VALIDATION] Body validation error:', error);
      return res.status(500).json({
        error: 'VALIDATION_ERROR',
        message: 'Internal validation error'
      });
    }
  };
}

// Query parameter validation middleware
export function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: Response, next: any) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          error: 'INVALID_QUERY_PARAMETERS',
          message: 'Query parameter validation failed',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      console.error('[VALIDATION] Query validation error:', error);
      return res.status(500).json({
        error: 'VALIDATION_ERROR',
        message: 'Internal validation error'
      });
    }
  };
}

// URL validation for feedback URLs
export const urlSchema = z.string().url("Invalid URL format");

export function validateURL(url: string): boolean {
  try {
    urlSchema.parse(url);
    return true;
  } catch {
    return false;
  }
}

// Enhanced validation middleware for route parameters
export function validateParam(paramName: string) {
  return (req: any, res: Response, next: any) => {
    const value = req.params[paramName];
    if (!value) {
      return res.status(400).json({ 
        error: 'MISSING_PARAMETER',
        message: `Missing required parameter: ${paramName}`,
        details: `The ${paramName} parameter is required for this request` 
      });
    }
    
    if (!validateUUID(value)) {
      return res.status(400).json({ 
        error: 'INVALID_PARAMETER_FORMAT',
        message: `Invalid ${paramName} format`,
        details: `The ${paramName} must be a valid UUID format`,
        received: value
      });
    }
    
    next();
  };
}

// Enhanced validation for tenant access (ensures user belongs to the tenant)
export async function validateTenantAccess(
  userId: string, 
  tenantId: string, 
  storage: any
): Promise<{ valid: boolean, user?: any, error?: string, errorCode?: string }> {
  try {
    if (!validateUUID(tenantId)) {
      return { 
        valid: false, 
        error: "Invalid tenant ID format", 
        errorCode: 'INVALID_TENANT_ID' 
      };
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return { 
        valid: false, 
        error: "User not found", 
        errorCode: 'USER_NOT_FOUND' 
      };
    }
    
    // Platform admins have access to all tenants
    if (user.role === 'platform_admin') {
      return { valid: true, user };
    }
    
    // Regular users must belong to the tenant they're accessing
    if (user.tenantId !== tenantId) {
      return { 
        valid: false, 
        error: "Access denied - User does not belong to this tenant", 
        errorCode: 'TENANT_ACCESS_DENIED' 
      };
    }
    
    return { valid: true, user };
  } catch (error) {
    console.error('[VALIDATION] Tenant access validation failed:', error);
    return { 
      valid: false, 
      error: "Failed to validate tenant access", 
      errorCode: 'VALIDATION_ERROR' 
    };
  }
}