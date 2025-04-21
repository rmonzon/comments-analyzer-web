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
import { apiRequest, queryClient } from '@/lib/queryClient';
import { VideoData, VideoAnalysis, Comment, KeyPoint, SentimentStats } from '@shared/types';

// Helper function to validate and convert data to correct types
function isVideoData(data: any): data is VideoData {
  return data && 
    typeof data.id === 'string' && 
    typeof data.title === 'string' &&
    Array.isArray(data.comments);
}

function isVideoAnalysis(data: any): data is VideoAnalysis {
  return data && 
    typeof data.videoId === 'string' && 
    typeof data.comprehensive === 'string' &&
    typeof data.commentsAnalyzed === 'number';
}

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
  } = useQuery<VideoData>({
    queryKey: ['/api/youtube/video', videoId],
    enabled: !!videoId,
  });

  const [analysisData, setAnalysisData] = useState<VideoAnalysis | null>(null);

  const generateSummaryMutation = useMutation<VideoAnalysis, Error, string>({
    mutationFn: async (videoId: string) => {
      console.log("Starting summary generation for video ID:", videoId);
      try {
        const response = await apiRequest('POST', '/api/youtube/summarize', { videoId });
        console.log("Raw API response:", response);
        const data = await response.json();
        console.log("Parsed data from API:", data);
        // Validate the shape of the data
        if (!data || typeof data !== 'object') {
          throw new Error("Invalid response data format");
        }
        return data as VideoAnalysis;
      } catch (error) {
        console.error("Error in summary mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Summary generated successfully:", data);
      setAnalysisData(data);
    },
    onError: (error: any) => {
      console.error("Error in summary mutation:", error);
      let errorMessage = "Failed to generate summary";
      
      if (error?.message) {
        if (error.message.includes("404")) {
          errorMessage = "Video not found or comments unavailable. Please check if the video exists and has public comments.";
        } else if (error.message.includes("No comments available")) {
          errorMessage = "No comments available for this video. Please try a different video with more engagement.";
        } else {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (submittedUrl: string) => {
    const id = extractVideoId(submittedUrl);
    if (id) {
      setVideoId(id);
      setUrl(submittedUrl);
      setAnalysisData(null); // Clear previous analysis
      
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

  const isLoading = isVideoLoading || generateSummaryMutation.isPending;
  const isError = isVideoError || generateSummaryMutation.isError;
  const errorMessage = videoError?.toString() || generateSummaryMutation.error?.message || "An unexpected error occurred";

  // Use the analysis data directly from the mutation or state
  const currentAnalysisData = analysisData || generateSummaryMutation.data;

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
        
        {videoData && currentAnalysisData && !isLoading && !isError && (
          <div>
            <ResultsSection 
              videoData={videoData} 
              analysisData={currentAnalysisData} 
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
