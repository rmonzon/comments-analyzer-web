interface ErrorStateProps {
  errorMessage: string;
  onTryAgain: () => void;
}

export default function ErrorState({ errorMessage, onTryAgain }: ErrorStateProps) {
  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <div className="mb-4 text-red-500">
          <span className="material-icons text-5xl">error_outline</span>
        </div>
        <h3 className="text-lg font-medium mb-2">Unable to Process Video</h3>
        <p className="text-youtube-dark-grey mb-4">
          {errorMessage || "We couldn't analyze the comments for this video. This could be due to disabled comments, private video settings, or API limitations."}
        </p>
        <button 
          onClick={onTryAgain}
          className="bg-youtube-red hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg focus:outline-none transition duration-150"
        >
          Try Again
        </button>
      </div>
    </section>
  );
}
