import { Link } from "wouter";
import { ArrowLeft, Youtube, MessageSquare, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="outline" className="mb-6" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-6">About YouTube Comment Analyzer</h1>
      </div>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Youtube className="h-5 w-5 text-red-600 mr-2" />
            Our Mission
          </h2>
          <p>
            YouTube Comment Analyzer was created to help content creators, researchers, and curious viewers
            make sense of the often overwhelming comment sections on YouTube videos. Our mission is to provide
            insightful, accessible analysis of public discourse on one of the internet's largest platforms.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
            What We Do
          </h2>
          <p className="mb-4">
            Our tool uses artificial intelligence to analyze YouTube video comments and generate:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Comprehensive summaries of main discussion points</li>
            <li>Sentiment analysis showing positive, neutral, and negative reactions</li>
            <li>Key insights that might be missed when skimming through hundreds of comments</li>
            <li>Visualizations that make understanding comment sentiment intuitive</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Brain className="h-5 w-5 text-purple-500 mr-2" />
            How It Works
          </h2>
          <p className="mb-4">
            Our system combines the YouTube Data API with advanced natural language processing:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>You provide a YouTube video URL</li>
            <li>We fetch comments from the YouTube API (currently limited to 20 comments in the standard version)</li>
            <li>Our AI processes the comments to identify common themes and sentiment</li>
            <li>The analysis is presented in an easy-to-understand format</li>
            <li>Results are cached to improve performance and reduce API usage</li>
          </ol>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="h-5 w-5 text-yellow-500 mr-2" />
            Future Development
          </h2>
          <p className="mb-4">
            We're constantly working to improve YouTube Comment Analyzer. Some features on our roadmap include:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Analysis of a larger number of comments for more comprehensive insights</li>
            <li>Advanced filtering options to focus on specific topics or sentiment</li>
            <li>Trend analysis for videos with comments over time</li>
            <li>Customizable reports for content creators and marketers</li>
            <li>Integration with other social media platforms for cross-platform analysis</li>
          </ul>
          <p className="mt-4">
            We value your feedback! If you have suggestions for improvements or new features,
            please let us know through the premium interest form on the main page.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          <p>
            Have questions, feedback, or need assistance? Contact us at:{" "}
            <a
              href="mailto:contact@ytcommentanalyzer.com"
              className="text-blue-600 dark:text-blue-400"
            >
              contact@ytcommentanalyzer.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}