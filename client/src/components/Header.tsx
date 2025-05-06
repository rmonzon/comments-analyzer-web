import { ThemeToggle } from "./ThemeToggle";
import { VideoIcon, AlertCircle, LogOut, User, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, isLoading } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <VideoIcon className="text-youtube-red h-6 w-6 mr-2" />
          <h1 className="text-xl md:text-2xl font-medium font-roboto text-gray-900 dark:text-white">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              YouTube Comments Summarizer
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
          
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    {user.profileImageUrl && (
                      <AvatarImage src={user.profileImageUrl} alt={user.username} />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => window.location.href = "/api/login"}
            >
              <User className="h-4 w-4 mr-2" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
