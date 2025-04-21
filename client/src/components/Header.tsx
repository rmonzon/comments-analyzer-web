import { useState } from 'react';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return (
    <header className="bg-white border-b border-youtube-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons text-youtube-red mr-2">smart_display</span>
          <h1 className="text-xl md:text-2xl font-medium font-roboto">YouTube Comment Summarizer</h1>
        </div>
        <div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-youtube-light-grey"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="material-icons">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
