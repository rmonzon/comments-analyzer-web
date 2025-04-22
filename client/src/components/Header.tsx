import { ThemeToggle } from "./ThemeToggle";
import { VideoIcon, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <VideoIcon className="text-youtube-red h-6 w-6 mr-2" />
          <h1 className="text-xl md:text-2xl font-medium font-roboto text-gray-900 dark:text-white">
            YouTube Comments Summarizer
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
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
