import { ThemeToggle } from "./ThemeToggle";
import { AlertCircle, User } from "lucide-react";
import { BrandIcon } from "./BrandIcon";
import { Link } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";

export default function Header() {
  // Sign in button click handler (placeholder for future implementation)
  const handleSignIn = () => {
    // Will be implemented with a different auth flow later
    console.log("Sign in clicked - to be implemented");
    alert("Authentication will be implemented in a future update");
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
            
            {/* Simplified login button for future auth implementation */}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={handleSignIn}
            >
              <User className="h-4 w-4 mr-2" />
              <span>Sign In</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
