import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export function useAuth() {
  const { 
    data: user, 
    isLoading,
    error,
  } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}