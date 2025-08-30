import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorBoundary, { ErrorFallbackProps } from './ErrorBoundary';

// Smaller error fallback for individual page components
const PageErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="flex-1 flex items-center justify-center p-8" data-testid="page-error-fallback">
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <CardTitle className="text-lg text-orange-900">Page Error</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          This page encountered an error and couldn't load properly.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs font-mono text-orange-800 break-all">
            {error.message}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={resetError}
            size="sm"
            className="flex-1"
            data-testid="button-retry-page"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="flex-1"
            data-testid="button-home-page"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Page-level error boundary with smaller fallback UI
export const PageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary fallback={PageErrorFallback}>
    {children}
  </ErrorBoundary>
);

export default PageErrorBoundary;