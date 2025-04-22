import { ThemeToggle } from './ThemeToggle';
import { VideoIcon } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <VideoIcon className="text-youtube-red h-6 w-6 mr-2" />
          <h1 className="text-xl md:text-2xl font-medium font-roboto text-gray-900 dark:text-white">
            YouTube Comment Summarizer
          </h1>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
