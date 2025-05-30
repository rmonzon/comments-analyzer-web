import { Link } from "wouter";
import { Chrome, BarChart3 } from "lucide-react";
import { BrandIcon } from "./BrandIcon";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand Section */}
          <div>
            <div className="flex items-center mb-3">
              <BrandIcon className="h-6 w-6 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                YouTube Comments Analyzer
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              AI-powered comment analysis for YouTube videos. Get instant sentiment analysis, key insights, and comprehensive summaries.
            </p>
            <a 
              href="https://chromewebstore.google.com/detail/youtube-comments-analyzer/jojpopolngligeffhficnhlhliebahep"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
            >
              <Chrome className="h-4 w-4 mr-1" />
              Chrome Extension Available
            </a>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  Comment Analyzer Tool
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Analysis History
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/rriverom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  Contact Developer
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © {new Date().getFullYear()} YouTube Comments Analyzer by{" "}
                <a
                  href="https://www.linkedin.com/in/rriverom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-800 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  Raul Rivero
                </a>
                . All rights reserved.
              </p>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-500">
              <span>Free YouTube Comment Analysis Tool | AI-Powered Sentiment Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
