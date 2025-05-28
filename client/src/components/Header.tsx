import { ThemeToggle } from "./ThemeToggle";
import { VideoIcon, AlertCircle, User } from "lucide-react";
import { Link } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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
          <VideoIcon className="text-youtube-red h-6 w-6 mr-2" />
          <h1 className="text-xl md:text-2xl font-medium font-roboto text-gray-900 dark:text-white">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              YouTube Comments Analyzer
            </Link>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-2 text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-youtube-red text-white font-normal beta-badge cursor-help">
                    BETA
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-gray-900 text-white border-gray-800 flex items-center max-w-[250px]"
                  side="bottom"
                >
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-youtube-red flex-shrink-0" />
                  <span className="text-xs">
                    This app is in beta and may contain errors
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h1>
        </div>
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
    </header>
  );
}
