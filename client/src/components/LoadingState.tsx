import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { ArrowDown, BarChart2, MessageSquare, RefreshCcw, Play, Brain, Search, Sparkles } from 'lucide-react';

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
      icon: <MessageSquare className="h-6 w-6 text-youtube-red animate-bounce" />,
      color: "text-youtube-red",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      message: "Processing comment data...",
      icon: <RefreshCcw className="h-6 w-6 text-youtube-blue animate-spin" />,
      color: "text-youtube-blue", 
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      message: "Analyzing sentiment patterns...",
      icon: <Brain className="h-6 w-6 text-green-500 animate-pulse" />,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      message: "Generating AI insights...",
      icon: <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
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
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center overflow-hidden relative">
        {/* YouTube-style animated background */}
        <div className="absolute inset-0 opacity-5">
          <div className="youtube-bg-animation"></div>
        </div>
        
        <div className="relative z-10">
          {/* Enhanced YouTube-style loading dots */}
          <div className="mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="youtube-logo-animation">
                <Play className="h-8 w-8 text-youtube-red" />
              </div>
            </div>
            <div className="comment-loader mb-4">
              <div className="comment-loader__dot"></div>
              <div className="comment-loader__dot"></div>
              <div className="comment-loader__dot"></div>
            </div>
          </div>
          
          {/* Enhanced stage indicator */}
          <div className={`w-20 h-20 flex items-center justify-center rounded-full mb-4 mx-auto transition-all duration-500 ${stages[currentStage].bgColor}`}>
            <div className="relative">
              {stages[currentStage].icon}
              <div className="absolute -inset-1 bg-gradient-to-r from-youtube-red to-youtube-blue rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-2 dark:text-white bg-gradient-to-r from-youtube-red to-youtube-blue bg-clip-text text-transparent">
            Analyzing YouTube Comments
          </h3>
          <p className={`text-lg font-medium mb-8 transition-all duration-300 ${stages[currentStage].color}`}>
            {message}
          </p>
          
          {/* Enhanced Progress Section */}
          <div className="mt-8 w-full max-w-2xl mx-auto">
            {/* Stage Indicators */}
            <div className="flex justify-between mb-6">
              {stages.map((stage, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className={`w-3 h-3 rounded-full mb-2 transition-all duration-500 ${
                    index <= currentStage 
                      ? 'bg-youtube-red shadow-lg shadow-red-500/50' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {index <= currentStage && (
                      <div className="w-full h-full bg-youtube-red rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <span className={`text-xs font-medium transition-all duration-300 ${
                    index <= currentStage 
                      ? 'text-youtube-red dark:text-red-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {['Fetch', 'Process', 'Analyze', 'Generate'][index]}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Enhanced YouTube-style progress bar */}
            <div className="relative h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div 
                className="absolute h-full bg-gradient-to-r from-youtube-red to-red-600 transition-all duration-500 ease-out rounded-full shadow-lg"
                style={{ width: `${currentProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            </div>
            
            {/* Progress percentage */}
            <div className="mt-4 text-center">
              <span className="text-2xl font-bold text-youtube-red dark:text-red-400">
                {Math.round(currentProgress)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Complete</span>
            </div>
            
            {/* YouTube-style loading bars */}
            <div className="mt-8 flex justify-center items-center gap-4">
              <div className="youtube-progress-bar flex-1 max-w-24"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 px-4 text-center">
                Powered by YouTube API & AI Analysis
              </p>
              <div className="youtube-progress-bar flex-1 max-w-24"></div>
            </div>
            
            {/* Time estimate */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Search className="h-4 w-4 animate-spin" />
                <span>This usually takes 30-60 seconds for videos with many comments...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
