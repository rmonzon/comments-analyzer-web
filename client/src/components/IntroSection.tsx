export default function IntroSection() {
  return (
    <section className="mb-8">
      <div className="bg-white rounded-lg shadow-card p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium mb-3 font-roboto">AI-Powered Comment Analysis</h2>
        <p className="text-youtube-dark-grey font-open-sans mb-5">
          Paste any YouTube video URL to get an AI-generated summary of the comment section. Quickly understand viewer opinions, sentiment, and main discussion points without scrolling through hundreds of comments.
        </p>
        <div className="flex flex-wrap -mx-2">
          <div className="px-2 w-full md:w-1/3 mb-4">
            <div className="flex flex-col items-center p-4 bg-youtube-light-grey rounded-lg h-full">
              <span className="material-icons text-youtube-blue text-3xl mb-2">link</span>
              <h3 className="font-medium text-center mb-1">Paste URL</h3>
              <p className="text-sm text-center text-youtube-dark-grey">Enter any YouTube video link</p>
            </div>
          </div>
          <div className="px-2 w-full md:w-1/3 mb-4">
            <div className="flex flex-col items-center p-4 bg-youtube-light-grey rounded-lg h-full">
              <span className="material-icons text-youtube-blue text-3xl mb-2">forum</span>
              <h3 className="font-medium text-center mb-1">Fetch Comments</h3>
              <p className="text-sm text-center text-youtube-dark-grey">We collect the video's comments</p>
            </div>
          </div>
          <div className="px-2 w-full md:w-1/3 mb-4">
            <div className="flex flex-col items-center p-4 bg-youtube-light-grey rounded-lg h-full">
              <span className="material-icons text-youtube-blue text-3xl mb-2">psychology</span>
              <h3 className="font-medium text-center mb-1">AI Summary</h3>
              <p className="text-sm text-center text-youtube-dark-grey">Get concise AI-powered insights</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
