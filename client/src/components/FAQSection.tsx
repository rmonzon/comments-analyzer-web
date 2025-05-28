import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is YouTube comment analysis and how does it work?",
    answer: "YouTube comment analysis uses artificial intelligence to process and analyze comments from YouTube videos. Our tool extracts sentiment (positive, negative, neutral), identifies key discussion topics, and generates comprehensive summaries to help you understand audience feedback without reading hundreds of individual comments."
  },
  {
    question: "Is the YouTube Comments Analyzer free to use?",
    answer: "Yes! Our basic YouTube comment analysis tool is completely free. You can analyze any public YouTube video and get AI-powered sentiment analysis, key insights, and comprehensive summaries at no cost."
  },
  {
    question: "How accurate is the AI sentiment analysis?",
    answer: "Our AI-powered sentiment analysis uses advanced natural language processing models to achieve high accuracy in detecting positive, negative, and neutral sentiments. While no AI system is 100% perfect, our tool provides reliable insights that help you understand overall audience reactions and opinions."
  },
  {
    question: "Can I analyze comments from private or unlisted YouTube videos?",
    answer: "No, our tool can only analyze comments from public YouTube videos. This is because we use the official YouTube Data API, which only provides access to publicly available content. Private and unlisted videos' comments are not accessible through this API."
  },
  {
    question: "How many comments does the tool analyze per video?",
    answer: "Our free version analyzes up to 100 comments per video to provide meaningful insights while ensuring fast processing times. This sample size is typically sufficient to understand the overall sentiment and key discussion points in most YouTube videos."
  },
  {
    question: "Do you store my analyzed videos or personal data?",
    answer: "We only store analysis results to improve performance and provide you with a history of your analyzed videos. We do not collect personal information, and all data is handled according to our privacy policy. Video URLs and analysis results are stored temporarily for caching purposes."
  },
  {
    question: "Is there a Chrome extension available?",
    answer: "Yes! We offer a free Chrome extension that allows you to analyze YouTube comments directly from any video page with just one click. You can install it from the Chrome Web Store and start analyzing comments without leaving YouTube."
  },
  {
    question: "What types of insights can I get from comment analysis?",
    answer: "Our tool provides sentiment distribution (percentage of positive, negative, neutral comments), key discussion points, comprehensive summaries of main topics, and overall audience reaction analysis. This helps content creators, marketers, and researchers understand their audience better."
  },
  {
    question: "Can I use this tool for commercial purposes?",
    answer: "Yes, our YouTube comment analysis tool can be used for commercial purposes such as market research, content strategy, competitor analysis, and understanding customer feedback. It's particularly useful for businesses, content creators, and marketing professionals."
  },
  {
    question: "How long does it take to analyze a video's comments?",
    answer: "Most analyses complete within 10-30 seconds, depending on the number of comments and current server load. Our AI processes comments efficiently to provide you with quick insights without long waiting times."
  }
];

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="mb-12">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Everything you need to know about our YouTube comment analysis tool
        </p>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-white pr-4">
                  {item.question}
                </h3>
                {openItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Still have questions?</strong> Our YouTube comment analysis tool is designed to be intuitive and easy to use. Simply paste any YouTube URL above to get started with your first analysis!
          </p>
        </div>
      </div>
    </section>
  );
}