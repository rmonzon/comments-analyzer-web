import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} YouTube Comments Summarizer by{" "}
              <a
                href="https://www.linkedin.com/in/rriverom"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-gray-800 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300"
              >
                Raul Rivero
              </a>
              . All rights reserved.
            </p>
          </div>
          <div>
            <ul className="flex space-x-6">
              <li>
                <a
                  href="/?showHistory=true"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Analyzed Videos
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
