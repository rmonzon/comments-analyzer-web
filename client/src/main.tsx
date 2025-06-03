import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";
import { useEffect, useState } from "react";

function AppWithClerk() {
  const [clerkPubKey, setClerkPubKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config/clerk")
      .then(res => res.json())
      .then(data => {
        setClerkPubKey(data.publishableKey);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch Clerk config:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!clerkPubKey) {
    return <div className="flex items-center justify-center min-h-screen">Authentication configuration error</div>;
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(<AppWithClerk />);
