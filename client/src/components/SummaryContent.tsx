import { useState } from 'react';
import { VideoAnalysis } from '@shared/types';
import { copyToClipboard } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';

interface SummaryContentProps {
  analysis: VideoAnalysis;
}

export default function SummaryContent({ analysis }: SummaryContentProps) {
  const { toast } = useToast();
  const [keyCopied, setKeyCopied] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  const handleCopyKeyPoints = async () => {
    const content = analysis.keyPoints.map(point => 
      `${point.title}: ${point.content}`
    ).join('\n\n');
    
    const success = await copyToClipboard(`Key Discussion Points:\n\n${content}`);
    
    if (success) {
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } else {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopySummary = async () => {
    const success = await copyToClipboard(`Comment Summary:\n\n${analysis.comprehensive}`);
    
    if (success) {
      setSummaryCopied(true);
      setTimeout(() => setSummaryCopied(false), 2000);
    } else {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Overall Sentiment */}
      <div className="mb-8">
        <h3 className="font-medium mb-3 dark:text-white">Overall Sentiment</h3>
        <div className="flex items-center sentiment-glow">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 p-0.5 shadow-inner">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div 
                className="bg-positive h-full transition-all duration-700 ease-out" 
                style={{ width: `${analysis.sentimentStats.positive}%` }}
              ></div>
              <div 
                className="bg-neutral h-full transition-all duration-700 ease-out" 
                style={{ width: `${analysis.sentimentStats.neutral}%` }}
              ></div>
              <div 
                className="bg-negative h-full transition-all duration-700 ease-out" 
                style={{ width: `${analysis.sentimentStats.negative}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-3 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-positive inline-block mr-1.5 shadow-sm"></span>
            <span className="dark:text-gray-300">Positive ({analysis.sentimentStats.positive}%)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-neutral inline-block mr-1.5 shadow-sm"></span>
            <span className="dark:text-gray-300">Neutral ({analysis.sentimentStats.neutral}%)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-negative inline-block mr-1.5 shadow-sm"></span>
            <span className="dark:text-gray-300">Negative ({analysis.sentimentStats.negative}%)</span>
          </div>
        </div>
      </div>

      {/* Key Discussion Points */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium dark:text-white">Key Discussion Points</h3>
          <button 
            onClick={handleCopyKeyPoints}
            className="text-youtube-blue dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center focus:outline-none"
          >
            {keyCopied ? 
              <Check className="w-4 h-4 mr-1" /> : 
              <Copy className="w-4 h-4 mr-1" />
            }
            {keyCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="space-y-3">
          {analysis.keyPoints.map((point, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="font-medium mb-1 dark:text-white">{point.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{point.content}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Comprehensive Summary */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium dark:text-white">Comprehensive Summary</h3>
          <button 
            onClick={handleCopySummary}
            className="text-youtube-blue dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center focus:outline-none"
          >
            <span className="material-icons text-base mr-1">
              {summaryCopied ? 'check' : 'content_copy'}
            </span>
            {summaryCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          {analysis.comprehensive.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-300 mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">
          <p>Summary generated by AI based on {analysis.commentsAnalyzed} viewer comments. Video creator's comments are excluded to focus on audience feedback. Results may not represent all opinions.</p>
        </div>
      </div>
    </div>
  );
}
