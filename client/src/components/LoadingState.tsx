import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { ArrowDown, BarChart2, MessageSquare, RefreshCcw } from 'lucide-react';

interface LoadingStateProps {
  progress?: number;
}

export default function LoadingState({ progress = 0 }: LoadingStateProps) {
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [currentStage, setCurrentStage] = useState(0);
  const [message, setMessage] = useState("Fetching video comments...");
  
  const stages = [
    {
      message: "Fetching video comments...",
      icon: <MessageSquare className="h-6 w-6 text-youtube-red animate-bounce" />
    },
    {
      message: "Processing comment data...",
      icon: <RefreshCcw className="h-6 w-6 text-youtube-blue animate-spin" />
    },
    {
      message: "Analyzing sentiment patterns...",
      icon: <BarChart2 className="h-6 w-6 text-green-500 animate-pulse" />
    },
    {
      message: "Generating AI summary...",
      icon: <ArrowDown className="h-6 w-6 text-purple-500 animate-bounce" />
    }
  ];
  
  useEffect(() => {
    // Simulate progress if not provided or to make it more fluid
    let interval: number | undefined;
    
    if (progress > 0) {
      setCurrentProgress(progress);
      // Set stage based on provided progress
      if (progress > 75) setCurrentStage(3);
      else if (progress > 50) setCurrentStage(2);
      else if (progress > 25) setCurrentStage(1);
      else setCurrentStage(0);
    } else {
      interval = window.setInterval(() => {
        setCurrentProgress(prev => {
          // Slow down as we approach 100%
          const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 90 ? 1 : 0.5;
          const newProgress = Math.min(prev + increment, 95);
          
          // Update stage and message based on progress
          if (newProgress > 75 && prev <= 75) {
            setCurrentStage(3);
          } else if (newProgress > 50 && prev <= 50) {
            setCurrentStage(2);
          } else if (newProgress > 25 && prev <= 25) {
            setCurrentStage(1);
          }
          
          return newProgress;
        });
      }, 300);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress]);

  // Update message based on current stage
  useEffect(() => {
    setMessage(stages[currentStage].message);
  }, [currentStage]);

  return (
    <section className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="comment-loader mb-2">
            <div className="comment-loader__dot"></div>
            <div className="comment-loader__dot"></div>
            <div className="comment-loader__dot"></div>
          </div>
          
          <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-full mb-3">
            {stages[currentStage].icon}
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Analyzing YouTube Comments</h3>
          <p className="text-gray-600">{message}</p>
          
          {/* Progress Tracker */}
          <div className="mt-8 w-full max-w-md">
            <div className="flex justify-between mb-2 text-sm text-gray-500">
              <span>Fetching</span>
              <span>Processing</span>
              <span>Analyzing</span>
              <span>Summarizing</span>
            </div>
            
            {/* Custom YouTube-style progress bar */}
            <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-youtube-red transition-all duration-500 ease-out"
                style={{ width: `${currentProgress}%` }}
              ></div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="youtube-progress-bar w-full sm:w-24"></div>
              <p className="text-sm text-gray-500">
                This may take a minute for videos with many comments...
              </p>
              <div className="youtube-progress-bar w-full sm:w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
