import { Link2, MessageSquare, Brain, Chrome, ExternalLink } from "lucide-react";
import PremiumFeatureInterest from "./PremiumFeatureInterest";

export default function IntroSection() {
  return (
    <section className="mb-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 font-roboto dark:text-white">
          AI-Powered YouTube Comment Analysis Tool
        </h2>
        <p className="text-gray-600 dark:text-gray-300 font-open-sans mb-5 text-lg leading-relaxed">
          Analyze YouTube video comments instantly with our advanced AI technology. Get comprehensive sentiment analysis, key insights, and detailed summaries from any YouTube video's comment section. Perfect for content creators, marketers, researchers, and anyone who wants to understand audience feedback quickly and efficiently.
        </p>
        
        {/* <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Why Use YouTube Comment Analysis?
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
            <li>• <strong>Save Time:</strong> No more scrolling through hundreds of comments</li>
            <li>• <strong>Understand Sentiment:</strong> Get instant positive, negative, and neutral feedback analysis</li>
            <li>• <strong>Extract Key Insights:</strong> Discover the main topics and opinions viewers are discussing</li>
            <li>• <strong>Make Data-Driven Decisions:</strong> Use audience feedback to improve your content strategy</li>
          </ul>
        </div> */}
        <div className="flex flex-wrap -mx-2">
          <div className="px-2 w-full md:w-1/3 mb-4">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg h-full transition-colors">
              <Link2 className="text-youtube-blue dark:text-blue-400 w-6 h-6 mb-2" />
              <h3 className="font-medium text-center mb-1 dark:text-white">
                Paste URL
              </h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Enter any YouTube video link
              </p>
            </div>
          </div>
          <div className="px-2 w-full md:w-1/3 mb-4">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg h-full transition-colors">
              <MessageSquare className="text-youtube-blue dark:text-blue-400 w-6 h-6 mb-2" />
              <h3 className="font-medium text-center mb-1 dark:text-white">
                Fetch Comments
              </h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                We analyze the top comments
              </p>
            </div>
          </div>
          <div className="px-2 w-full md:w-1/3 mb-4">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg h-full transition-colors">
              <Brain className="text-youtube-blue dark:text-blue-400 w-6 h-6 mb-2" />
              <h3 className="font-medium text-center mb-1 dark:text-white">
                AI Summary
              </h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Get concise AI-powered insights
              </p>
            </div>
          </div>
        </div>

        {/* Chrome Extension Call-to-Action */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Chrome className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  Try Our Chrome Extension!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Analyze YouTube comments directly from any video page with one click
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <a
                href="https://chromewebstore.google.com/detail/youtube-comments-analyzer/jojpopolngligeffhficnhlhliebahep"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <span className="mr-2">Add to Chrome</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Premium Feature Interest Banner */}
        {/* <PremiumFeatureInterest /> */}
      </div>
    </section>
  );
}
