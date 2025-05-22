import { useState, FormEvent, ChangeEvent } from 'react';
import { validateYouTubeUrl } from '@/lib/utils';
import { PlayCircle, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface URLInputFormProps {
  onSubmit: (url: string, maxComments?: number) => void;
}

export default function URLInputForm({ onSubmit }: URLInputFormProps) {
  const [url, setUrl] = useState<string>('');
  const [isValidUrl, setIsValidUrl] = useState<boolean>(true);
  const [maxComments, setMaxComments] = useState<string>('100');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setUrl(inputValue);
    
    // If the input is not empty and we previously showed an error, validate it again
    if (inputValue && !isValidUrl) {
      setIsValidUrl(validateYouTubeUrl(inputValue));
    } else if (!inputValue) {
      // Reset validation state when input is empty
      setIsValidUrl(true);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setIsValidUrl(false);
      return;
    }
    
    if (validateYouTubeUrl(url)) {
      setIsValidUrl(true);
      onSubmit(url, parseInt(maxComments));
    } else {
      setIsValidUrl(false);
    }
  };

  return (
    <section className="mb-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium mb-4 font-roboto dark:text-white">Enter YouTube Video URL</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="comment-count" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Comments to Analyze
            </Label>
            <Select value={maxComments} onValueChange={setMaxComments}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select comment count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 comments</SelectItem>
                <SelectItem value="500">500 comments</SelectItem>
                <SelectItem value="1000">1000 comments</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex flex-col sm:flex-row">
              <div className="relative flex-grow mb-2 sm:mb-0">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <PlayCircle className="text-gray-500 dark:text-gray-400 w-5 h-5" />
                </span>
                <input 
                  type="text" 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className={`w-full pl-10 pr-4 py-3 border ${!isValidUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} 
                    rounded-lg sm:rounded-r-none dark:bg-gray-800 dark:text-white dark:placeholder-gray-400
                    focus:outline-none focus:ring-1 focus:ring-youtube-blue dark:focus:ring-blue-500`}
                  value={url}
                  onChange={handleInputChange}
                />
                {!isValidUrl && (
                  <div className="text-sm mt-1 text-red-500 dark:text-red-400">
                    Please enter a valid YouTube URL
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                className="bg-youtube-red hover:bg-red-700 text-white font-medium py-3 px-5 rounded-lg sm:rounded-l-none 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-youtube-red dark:focus:ring-offset-gray-900
                  transition duration-150"
              >
                Summarize
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
              <Info className="w-3.5 h-3.5 mr-1" />
              Supports standard YouTube URLs and Shorts
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
