import { useQuery } from "@tanstack/react-query";

interface AuthStatus {
  isAuthenticated: boolean;
  hasVercelOAuth: boolean;
  isDevelopment: boolean;
  bypassAuth?: boolean;
}

export function useAuth() {
  // Check auth status first to see if we're bypassing auth
  const { data: authStatus, isLoading: statusLoading } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"],
    retry: false,
  });

  const { data: user, isLoading: userLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !statusLoading, // Wait for status to load first
  });

  // If bypassing auth, check for selected user in localStorage
  const selectedUserId = typeof window !== 'undefined' ? localStorage.getItem('selectedUserId') : null;

  // When bypassing auth, we're always authenticated
  const isAuthenticated = authStatus?.bypassAuth || !!user;
  const isLoading = statusLoading || (userLoading && !authStatus?.bypassAuth);

  return {
    user,
    isLoading,
    isAuthenticated,
    authStatus,
    hasVercelOAuth: authStatus?.hasVercelOAuth || false,
    isDevelopment: authStatus?.isDevelopment || false,
    bypassAuth: authStatus?.bypassAuth || false,
    selectedUserId,
    error,
  };
}
