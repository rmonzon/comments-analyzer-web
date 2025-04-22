import React from 'react';
import VideoInfoCard from './VideoInfoCard';
import AnalysisTabs from './AnalysisTabs';
import { VideoData, VideoAnalysis } from '@shared/types';

interface ResultsSectionProps {
  videoData: VideoData;
  analysisData: VideoAnalysis;
  isCachedAnalysis?: boolean;
  isRefreshing?: boolean;
  onRefreshAnalysis?: () => void;
}

export default function ResultsSection({ 
  videoData, 
  analysisData, 
  isCachedAnalysis = false,
  isRefreshing = false,
  onRefreshAnalysis 
}: ResultsSectionProps) {
  return (
    <section className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Analysis Results</h2>
        <div className="flex items-center gap-2">
          {isCachedAnalysis && (
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              Using cached analysis
            </span>
          )}
          {onRefreshAnalysis && (
            <button
              onClick={onRefreshAnalysis}
              disabled={isRefreshing}
              className={`px-3 py-1 rounded text-sm ${
                isRefreshing 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-youtube-blue text-white hover:bg-blue-700'
              }`}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Analysis'}
            </button>
          )}
        </div>
      </div>
      <VideoInfoCard video={videoData} />
      <AnalysisTabs 
        comments={videoData.comments}
        analysis={analysisData}
      />
    </section>
  );
}
