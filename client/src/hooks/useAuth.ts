// Mock authentication hook for future implementation
export interface User {
  id: string;
  username: string;
  email: string | null;
  profileImageUrl: string | null;
}

export function useAuth() {
  // This is a placeholder for future authentication implementation
  const user = null;
  const isLoading = false;
  const error = null;
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated: false,
  };
}