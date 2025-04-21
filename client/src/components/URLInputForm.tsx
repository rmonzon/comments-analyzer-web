import { useState, FormEvent, ChangeEvent } from 'react';
import { validateYouTubeUrl } from '@/lib/utils';

interface URLInputFormProps {
  onSubmit: (url: string) => void;
}

export default function URLInputForm({ onSubmit }: URLInputFormProps) {
  const [url, setUrl] = useState<string>('');
  const [isValidUrl, setIsValidUrl] = useState<boolean>(true);

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
      onSubmit(url);
    } else {
      setIsValidUrl(false);
    }
  };

  return (
    <section className="mb-8">
      <div className="bg-white rounded-lg shadow-card p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium mb-4 font-roboto">Enter YouTube Video URL</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-icons text-youtube-dark-grey text-lg">play_circle</span>
                </span>
                <input 
                  type="text" 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className={`w-full pl-10 pr-4 py-3 border ${!isValidUrl ? 'border-red-500' : 'border-youtube-border'} rounded-l-lg focus:outline-none focus:border-youtube-blue`}
                  value={url}
                  onChange={handleInputChange}
                />
                {!isValidUrl && (
                  <div className="text-sm mt-1 text-red-500">
                    Please enter a valid YouTube URL
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                className="bg-youtube-red bg-red-700 text-white font-medium py-3 px-5 rounded-r-lg focus:outline-none transition duration-150"
              >
                Summarize
              </button>
            </div>
            <p className="text-sm text-youtube-dark-grey mt-2">
              <span className="material-icons text-xs align-middle">info</span>
              Supports standard YouTube URLs and Shorts
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
