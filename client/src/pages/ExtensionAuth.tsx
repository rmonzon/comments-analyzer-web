import { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from "@clerk/clerk-react";
import { BrandIcon } from "@/components/BrandIcon";

const TOKEN_TEMPLATE = "extension";
// Refresh shortly before a typical 1-hour token expires.
const REFRESH_INTERVAL_MS = 50 * 60 * 1000;

export default function ExtensionAuth() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [status, setStatus] = useState<
    "idle" | "posting" | "posted" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;
    let intervalId: number | undefined;

    const postFreshToken = async () => {
      try {
        setStatus("posting");
        let token: string | null = null;
        try {
          token = await getToken({ template: TOKEN_TEMPLATE });
        } catch {
          // Fall back to default session token if template isn't configured.
          token = await getToken();
        }
        if (cancelled) return;
        if (!token) {
          setStatus("error");
          setErrorMsg("Could not get a session token from Clerk.");
          return;
        }
        // Posted to same origin only; the extension's content script picks it up.
        window.postMessage(
          {
            type: "CAE_EXTENSION_TOKEN",
            token,
            issuedAt: Date.now(),
          },
          window.location.origin,
        );
        setStatus("posted");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      }
    };

    void postFreshToken();
    intervalId = window.setInterval(postFreshToken, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <BrandIcon className="w-8 h-8" />
          <h1 className="text-xl font-semibold">Extension Sign-In</h1>
        </div>

        <SignedOut>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Sign in to connect the YouTube Comments Analyzer Chrome extension
            to your account.
          </p>
          <SignInButton mode="modal">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors">
              Sign in to continue
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          {status === "posted" && (
            <>
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ✅ Signed in successfully
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  Your Chrome extension is now connected. You can close this
                  tab and return to the extension.
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Keep this tab open to auto-refresh your session, or close it
                and the extension will prompt you again when it expires.
              </p>
            </>
          )}
          {status === "posting" && (
            <p className="text-gray-600 dark:text-gray-300">
              Connecting to extension…
            </p>
          )}
          {status === "error" && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200 font-medium">
                Something went wrong
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                {errorMsg}
              </p>
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Signed in as
            </span>
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
