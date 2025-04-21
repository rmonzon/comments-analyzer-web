import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

interface LoadingStateProps {
  progress?: number;
}

export default function LoadingState({ progress = 0 }: LoadingStateProps) {
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [message, setMessage] = useState("Fetching comments and generating insights...");
  
  useEffect(() => {
    // Simulate progress if not provided or to make it more fluid
    let interval: number | undefined;
    
    if (progress > 0) {
      setCurrentProgress(progress);
    } else {
      interval = window.setInterval(() => {
        setCurrentProgress(prev => {
          // Slow down as we approach 100%
          const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 90 ? 1 : 0.5;
          const newProgress = Math.min(prev + increment, 95);
          
          // Update message based on progress
          if (newProgress > 75 && prev <= 75) {
            setMessage("Almost there! Generating AI summary...");
          } else if (newProgress > 50 && prev <= 50) {
            setMessage("Analyzing sentiment of comments...");
          } else if (newProgress > 25 && prev <= 25) {
            setMessage("Processing comment data...");
          }
          
          return newProgress;
        });
      }, 300);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress]);

  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <div className="mb-4">
          <div className="loader inline-block w-12 h-12 border-4 border-youtube-light-grey rounded-full"></div>
        </div>
        <h3 className="text-lg font-medium mb-2">Analyzing Comments</h3>
        <p className="text-youtube-dark-grey">{message}</p>
        <div className="mt-6">
          <Progress value={currentProgress} className="h-2 mb-2" />
          <p className="text-sm text-youtube-dark-grey">This may take a minute for videos with many comments</p>
        </div>
      </div>
    </section>
  );
}
