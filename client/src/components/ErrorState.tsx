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
  let errorIcon = "error_outline";
  let errorColor = "text-red-500";
  
  if (isQuotaError) {
    errorTitle = "API Rate Limit Exceeded";
    errorIcon = "timer_off";
    errorColor = "text-amber-500";
  } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
    errorTitle = "Video Not Found";
    errorIcon = "videocam_off";
  } else if (errorMessage.includes("No comments available")) {
    errorTitle = "No Comments Available";
    errorIcon = "chat_bubble_outline";
    errorColor = "text-gray-500";
  }
  
  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <div className={`mb-4 ${errorColor}`}>
          <span className="material-icons text-5xl">{errorIcon}</span>
        </div>
        <h3 className="text-lg font-medium mb-2">{errorTitle}</h3>
        <p className="text-youtube-dark-grey mb-6">
          {errorMessage || "We couldn't analyze the comments for this video. This could be due to disabled comments, private video settings, or API limitations."}
        </p>
        
        {isQuotaError ? (
          <div className="mb-6 bg-amber-50 p-4 rounded-md text-left">
            <h4 className="font-medium text-amber-800 mb-1">What This Means</h4>
            <p className="text-amber-700 text-sm mb-2">The OpenAI API rate limit has been reached. This typically happens when:</p>
            <ul className="text-sm text-amber-700 list-disc list-inside mb-2">
              <li>You've reached your API usage quota</li>
              <li>The API key needs to be refreshed</li>
              <li>There are temporary service issues with OpenAI</li>
            </ul>
            <p className="text-sm text-amber-700">Try again later or check your API key settings.</p>
          </div>
        ) : null}

        <button 
          onClick={onTryAgain}
          className="bg-youtube-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg focus:outline-none transition duration-150"
        >
          Try Again
        </button>
        
        <div className="mt-3">
          <button 
            onClick={() => window.location.reload()}
            className="text-youtube-blue hover:underline text-sm"
          >
            Start Over
          </button>
        </div>
      </div>
    </section>
  );
}
