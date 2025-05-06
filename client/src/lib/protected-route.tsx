import { Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

// Simplified ProtectedRoute without authentication checks for now
export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  // Since we've removed authentication, we'll just render the component directly
  // This will be updated when we implement a new authentication system
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}