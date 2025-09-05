import { useQuery } from "@tanstack/react-query";

interface AuthStatus {
  isAuthenticated: boolean;
  hasVercelOAuth: boolean;
  isDevelopment: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check auth status to see if Vercel OAuth is available
  const { data: authStatus } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authStatus,
    hasVercelOAuth: authStatus?.hasVercelOAuth || false,
    isDevelopment: authStatus?.isDevelopment || false,
    error,
  };
}
