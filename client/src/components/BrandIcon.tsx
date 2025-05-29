interface BrandIconProps {
  className?: string;
}

export function BrandIcon({ className = "w-6 h-6" }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main comment bubble */}
      <path
        d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V14C20 15.1046 19.1046 16 18 16H8L4 20V6Z"
        fill="currentColor"
        className="text-blue-600"
      />
      
      {/* Inner analysis elements - dots representing data points */}
      <circle cx="8" cy="10" r="1" fill="white" />
      <circle cx="12" cy="10" r="1" fill="white" />
      <circle cx="16" cy="10" r="1" fill="white" />
      
      {/* AI sparkle indicator */}
      <g className="text-blue-400" fill="currentColor">
        <path d="M18 2L19 4L21 3L20 5L22 6L20 7L21 9L19 8L18 10L17 8L15 9L16 7L14 6L16 5L15 3L17 4L18 2Z" />
      </g>
      
      {/* Subtle analysis chart line */}
      <path
        d="M6 12L8 11L10 13L12 10L14 12L16 9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}