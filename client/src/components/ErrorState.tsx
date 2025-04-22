import { AlertCircle, Clock, Video, MessageSquareOff } from 'lucide-react';

interface ErrorStateProps {
  errorMessage: string;
  onTryAgain: () => void;
}

export default function ErrorState({ errorMessage, onTryAgain }: ErrorStateProps) {
  // Determine if this is an API quota error
  const isQuotaError = errorMessage.includes('quota') || 
                      errorMessage.includes('rate limit') || 
                      errorMessage.includes('insufficient_quota');
  
  // Create a more user-friendly title based on the error message
  let errorTitle = "Unable to Process Video";
  let ErrorIcon = AlertCircle;
  let errorColor = "text-red-500 dark:text-red-400";
  
  if (isQuotaError) {
    errorTitle = "API Rate Limit Exceeded";
    ErrorIcon = Clock;
    errorColor = "text-amber-500 dark:text-amber-400";
  } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
    errorTitle = "Video Not Found";
    ErrorIcon = Video;
  } else if (errorMessage.includes("No comments available")) {
    errorTitle = "No Comments Available";
    ErrorIcon = MessageSquareOff;
    errorColor = "text-gray-500 dark:text-gray-400";
  }
  
  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 text-center">
        <div className={`mb-4 ${errorColor}`}>
          <ErrorIcon className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium mb-2 dark:text-white">{errorTitle}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {errorMessage || "We couldn't analyze the comments for this video. This could be due to disabled comments, private video settings, or API limitations."}
        </p>
        
        {isQuotaError ? (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/30 p-4 rounded-md text-left">
            <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-1">What This Means</h4>
            <p className="text-amber-700 dark:text-amber-300 text-sm mb-2">The OpenAI API rate limit has been reached. This typically happens when:</p>
            <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside mb-2">
              <li>You've reached your API usage quota</li>
              <li>The API key needs to be refreshed</li>
              <li>There are temporary service issues with OpenAI</li>
            </ul>
            <p className="text-sm text-amber-700 dark:text-amber-300">Try again later or check your API key settings.</p>
          </div>
        ) : null}

        <button 
          onClick={onTryAgain}
          className="bg-youtube-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
            transition duration-150"
        >
          Try Again
        </button>
        
        <div className="mt-3">
          <button 
            onClick={() => window.location.reload()}
            className="text-youtube-blue dark:text-blue-400 hover:underline text-sm"
          >
            Start Over
          </button>
        </div>
      </div>
    </section>
  );
}
