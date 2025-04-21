import React from 'react';
import VideoInfoCard from './VideoInfoCard';
import AnalysisTabs from './AnalysisTabs';
import { VideoData, VideoAnalysis } from '@shared/types';

interface ResultsSectionProps {
  videoData: VideoData;
  analysisData: VideoAnalysis;
}

export default function ResultsSection({ videoData, analysisData }: ResultsSectionProps) {
  return (
    <section className="max-w-4xl mx-auto animate-fade-in">
      <VideoInfoCard video={videoData} />
      <AnalysisTabs 
        comments={videoData.comments}
        analysis={analysisData}
      />
    </section>
  );
}
