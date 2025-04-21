import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SummaryContent from './SummaryContent';
import CommentsContent from './CommentsContent';
import { Comment, VideoAnalysis } from '@shared/types';

interface AnalysisTabsProps {
  comments: Comment[];
  analysis: VideoAnalysis;
}

export default function AnalysisTabs({ comments, analysis }: AnalysisTabsProps) {
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6 animate-fade-in">
      <Tabs defaultValue="summary">
        <TabsList className="w-full">
          <TabsTrigger value="summary">
            AI Summary
          </TabsTrigger>
          <TabsTrigger value="comments">
            Comments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <SummaryContent analysis={analysis} />
        </TabsContent>
        
        <TabsContent value="comments">
          <CommentsContent comments={comments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
