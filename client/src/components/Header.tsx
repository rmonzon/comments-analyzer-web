import { ThemeToggle } from "./ThemeToggle";
import { User } from "lucide-react";
import { BrandIcon } from "./BrandIcon";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserButton,
  SignedIn,
  SignInButton,
  SignedOut,
  useAuth,
} from "@clerk/clerk-react";

export default function Header() {
  const { isLoaded, has } = useAuth();
  let currentTier = "free";

  const getSubscriptionBadge = () => {
    if (isLoaded) {
      currentTier = has({ plan: "starter" })
        ? "starter"
        : has({ plan: "pro" })
          ? "pro"
          : "free";
    }
    switch (currentTier) {
      case "pro":
        return (
          <Badge variant="default" className="bg-blue-500 text-white text-xs">
            Pro
          </Badge>
        );
      case "starter":
        return (
          <Badge variant="default" className="bg-purple-500 text-white text-xs">
            Starter
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Free
          </Badge>
        );
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <BrandIcon className="h-8 w-8 mr-2" />
          <h1 className="text-xl md:text-2xl font-medium font-roboto text-gray-900 dark:text-white">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              YouTube Comments Analyzer
            </Link>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/analyze"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Analyze
            </Link>
            <Link
              href="/history"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              History
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/faq"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignedIn>
              <div className="flex items-center gap-2">
                {getSubscriptionBadge()}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
