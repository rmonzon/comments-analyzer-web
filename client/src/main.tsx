import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";
import { useEffect, useState } from "react";

function AppWrapper() {
  const [clerkKey, setClerkKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get the Clerk key from the server
    const fetchClerkKey = async () => {
      try {
        // Use a direct fetch to bypass Vite middleware
        const response = await fetch(window.location.origin + '/api/config/clerk', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.publishableKey) {
              setClerkKey(data.publishableKey);
            } else {
              setError('No publishable key in response');
            }
          } else {
            setError('Invalid response format');
          }
        } else {
          setError(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClerkKey();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (error || !clerkKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Authentication Setup Required
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error || 'Unable to load authentication configuration'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <App />
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(<AppWrapper />);
