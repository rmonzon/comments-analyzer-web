interface BrandIconProps {
  className?: string;
}

export function BrandIcon({ className = "w-6 h-6" }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* YouTube-inspired play button background */}
      <rect x="2" y="8" width="28" height="16" rx="3" fill="currentColor" className="text-red-600" />
      
      {/* Comment bubbles overlay */}
      <circle cx="8" cy="12" r="2" fill="white" />
      <circle cx="16" cy="12" r="2" fill="white" />
      <circle cx="24" cy="12" r="2" fill="white" />
      
      {/* AI/Analysis indicator - small sparkle */}
      <g className="text-blue-500" fill="currentColor">
        <path d="M26 4 L28 6 L26 8 L24 6 Z" />
        <path d="M27 2 L27 10" strokeWidth="0.5" stroke="currentColor" />
        <path d="M22 5 L30 5" strokeWidth="0.5" stroke="currentColor" />
      </g>
      
      {/* Sentiment analysis bars */}
      <g className="text-green-500" fill="currentColor">
        <rect x="6" y="20" width="2" height="4" rx="1" />
        <rect x="10" y="18" width="2" height="6" rx="1" />
        <rect x="14" y="19" width="2" height="5" rx="1" />
        <rect x="18" y="17" width="2" height="7" rx="1" />
        <rect x="22" y="20" width="2" height="4" rx="1" />
      </g>
    </svg>
  );
}