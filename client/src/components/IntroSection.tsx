import { Link2, MessageSquare, Brain } from 'lucide-react';

export default function IntroSection() {
  return (
    <section className="mb-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium mb-3 font-roboto dark:text-white">AI-Powered Comment Analysis</h2>
        <p className="text-gray-600 dark:text-gray-300 font-open-sans mb-5">
          Paste any YouTube video URL to get an AI-generated summary of the comment section. Quickly understand viewer opinions, sentiment, and main discussion points without scrolling through hundreds of comments.
        </p>
        <div className="flex flex-wrap -mx-2">
          <div className="px-2 w-full md:w-1/3 mb-4">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg h-full transition-colors">
              <Link2 className="text-youtube-blue dark:text-blue-400 w-6 h-6 mb-2" />
              <h3 className="font-medium text-center mb-1 dark:text-white">Paste URL</h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">Enter any YouTube video link</p>
            </div>
          </div>
          <div className="px-2 w-full md:w-1/3 mb-4">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg h-full transition-colors">
              <MessageSquare className="text-youtube-blue dark:text-blue-400 w-6 h-6 mb-2" />
              <h3 className="font-medium text-center mb-1 dark:text-white">Fetch Comments</h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">We collect the video's comments</p>
            </div>
          </div>
          <div className="px-2 w-full md:w-1/3 mb-4">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg h-full transition-colors">
              <Brain className="text-youtube-blue dark:text-blue-400 w-6 h-6 mb-2" />
              <h3 className="font-medium text-center mb-1 dark:text-white">AI Summary</h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">Get concise AI-powered insights</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
