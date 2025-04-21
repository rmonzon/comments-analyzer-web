import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IntroSection from '@/components/IntroSection';
import URLInputForm from '@/components/URLInputForm';
import ResultsSection from '@/components/ResultsSection';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { extractVideoId } from '@/lib/utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { VideoData, VideoAnalysis } from '@shared/types';

export default function Home() {
  const [url, setUrl] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    data: videoData,
    isLoading: isVideoLoading,
    isError: isVideoError,
    error: videoError,
    refetch: refetchVideo
  } = useQuery({
    queryKey: ['/api/youtube/video', videoId],
    enabled: !!videoId,
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const response = await apiRequest('POST', '/api/youtube/summarize', { videoId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/youtube/analysis', videoId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate summary: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isError: isAnalysisError,
    error: analysisError
  } = useQuery({
    queryKey: ['/api/youtube/analysis', videoId],
    enabled: !!videoId && !isVideoLoading && !isVideoError && !generateSummaryMutation.isPending,
  });

  const handleSubmit = async (submittedUrl: string) => {
    const id = extractVideoId(submittedUrl);
    if (id) {
      setVideoId(id);
      setUrl(submittedUrl);
      
      // If we have a new video ID, trigger the analysis
      if (id !== videoId) {
        const result = await refetchVideo();
        if (result.isSuccess) {
          generateSummaryMutation.mutate(id);
        }
      }
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive",
      });
    }
  };

  const handleTryAgain = () => {
    if (videoId) {
      refetchVideo();
      generateSummaryMutation.mutate(videoId);
    }
  };

  const isLoading = isVideoLoading || generateSummaryMutation.isPending || isAnalysisLoading;
  const isError = isVideoError || isAnalysisError;
  const errorMessage = (videoError || analysisError)?.toString() || "An unexpected error occurred";

  return (
    <div className="min-h-screen flex flex-col font-roboto">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <IntroSection />
        <URLInputForm onSubmit={handleSubmit} />
        
        {isLoading && <LoadingState progress={generateSummaryMutation.isPending ? 70 : 30} />}
        
        {isError && !isLoading && (
          <ErrorState errorMessage={errorMessage} onTryAgain={handleTryAgain} />
        )}
        
        {videoData && analysisData && !isLoading && !isError && (
          <ResultsSection 
            videoData={videoData as VideoData} 
            analysisData={analysisData as VideoAnalysis} 
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
