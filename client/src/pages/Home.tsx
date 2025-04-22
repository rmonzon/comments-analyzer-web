import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IntroSection from '@/components/IntroSection';
import URLInputForm from '@/components/URLInputForm';
import ResultsSection from '@/components/ResultsSection';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { useToast } from "@/hooks/use-toast";
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
  const [manualRetryMode, setManualRetryMode] = useState<boolean>(false);
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
      let isQuotaError = false;
      
      if (error?.message) {
        // Check for common error types
        if (error.message.includes("404")) {
          errorMessage = "Video not found or comments unavailable. Please check if the video exists and has public comments.";
        } else if (error.message.includes("No comments available")) {
          errorMessage = "No comments available for this video. Please try a different video with more engagement.";
        } else if (error.message.includes("exceeded your current quota") || 
                  error.message.includes("rate limit") || 
                  error.message.includes("insufficient_quota")) {
          errorMessage = "OpenAI API quota exceeded. Please try again later or update your API key.";
          isQuotaError = true;
        } else {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      }
      
      // Enable manual retry mode for API errors
      if (isQuotaError) {
        setManualRetryMode(true);
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
      // Only trigger fetching if it's a new ID
      const isNewVideo = id !== videoId;
      
      setUrl(submittedUrl);
      setAnalysisData(null); // Clear previous analysis
      
      if (isNewVideo) {
        console.log("New video ID detected, setting videoId:", id);
        // Set videoId which will trigger the useQuery automatically
        // The useEffect will trigger analysis after data is loaded
        setVideoId(id);
      } else {
        console.log("Same video ID, re-analyzing:", id);
        // For the same video ID, we should invalidate the query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/youtube/video', id] });
        // The useEffect will trigger analysis after data is refreshed
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
      console.log("Trying again for video ID:", videoId);
      
      // Clear analysis data
      setAnalysisData(null);
      
      // If we're in manual retry mode, trigger the analysis directly
      if (manualRetryMode) {
        // Reset manual retry mode to allow further auto-retries if this succeeds
        setManualRetryMode(false);
        
        // Directly trigger analysis if we have video data already
        if (videoData) {
          console.log("Manual retry - directly triggering analysis");
          generateSummaryMutation.mutate(videoId);
        } else {
          // If no video data, first fetch it then let the effect trigger the analysis
          console.log("Manual retry - fetching video data first");
          queryClient.invalidateQueries({ queryKey: ['/api/youtube/video', videoId] });
        }
      } else {
        // Standard retry flow - refresh video data and let effect handle analysis
        console.log("Standard retry - refreshing video data");
        queryClient.invalidateQueries({ queryKey: ['/api/youtube/video', videoId] });
      }
    }
  };

  const isLoading = isVideoLoading || generateSummaryMutation.isPending;
  const isError = isVideoError || generateSummaryMutation.isError;
  const errorMessage = videoError?.toString() || generateSummaryMutation.error?.message || "An unexpected error occurred";

  // Use the analysis data directly from the mutation or state
  const currentAnalysisData = analysisData || generateSummaryMutation.data;

  // Effect to trigger analysis when video data is loaded
  useEffect(() => {
    // Only auto-generate if we're not in manual retry mode
    if (videoId && 
        videoData && 
        !analysisData && 
        !generateSummaryMutation.isPending && 
        !manualRetryMode) {
      console.log("Video data loaded, triggering analysis for:", videoId);
      generateSummaryMutation.mutate(videoId);
    }
  }, [videoId, videoData, analysisData, generateSummaryMutation.isPending, manualRetryMode]);
  
  // Debug information
  useEffect(() => {
    console.log("DEBUG - Current state:");
    console.log("videoId:", videoId);
    console.log("videoData:", videoData);
    console.log("analysisData from state:", analysisData);
    console.log("analysisData from mutation:", generateSummaryMutation.data);
    console.log("currentAnalysisData:", currentAnalysisData);
    console.log("isLoading:", isLoading);
    console.log("isError:", isError);
    console.log("Should render ResultsSection:", Boolean(videoData && currentAnalysisData && !isLoading && !isError));
  }, [videoId, videoData, analysisData, generateSummaryMutation.data, isLoading, isError]);

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
        
        {/* Debug UI */}
        <div className="mt-8 p-4 border border-gray-200 rounded-md bg-gray-50 text-xs">
          <h3 className="font-bold">Debug Info:</h3>
          <div>Video ID: {videoId || 'none'}</div>
          <div>Has Video Data: {videoData ? 'Yes' : 'No'}</div>
          <div>Has Analysis Data: {currentAnalysisData ? 'Yes' : 'No'}</div>
          <div>Is Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Is Error: {isError ? 'Yes' : 'No'}</div>
          <div>Should Render Results: {Boolean(videoData && currentAnalysisData && !isLoading && !isError) ? 'Yes' : 'No'}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
