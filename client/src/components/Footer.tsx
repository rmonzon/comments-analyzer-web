export default function Footer() {
  return (
    <footer className="bg-white border-t border-youtube-border mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-youtube-dark-grey">
              © {new Date().getFullYear()} YouTube Comment Summarizer - Not affiliated with YouTube
            </p>
          </div>
          <div>
            <ul className="flex space-x-6">
              <li>
                <a href="#" className="text-sm text-youtube-dark-grey hover:text-youtube-black">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-youtube-dark-grey hover:text-youtube-black">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-youtube-dark-grey hover:text-youtube-black">
                  About
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
