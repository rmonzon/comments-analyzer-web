import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import URLInputForm from "@/components/URLInputForm";
import ResultsSection from "@/components/ResultsSection";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

import { useToast } from "@/hooks/use-toast";
import { extractVideoId } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  VideoData,
  VideoAnalysis,
} from "@shared/types";

export default function Analysis() {
  const [url, setUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [manualRetryMode, setManualRetryMode] = useState<boolean>(false);
  const [isSharedLink, setIsSharedLink] = useState<boolean>(false);
  const { toast } = useToast();

  // Handle shared links with videoId parameter
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedVideoId = params.get("videoId");
    
    if (sharedVideoId && !videoId) {
      // Keep the URL parameter visible for sharing purposes
      // Don't clear it so users can copy the URL to share again
      
      // Set the video ID and mark as shared link
      setVideoId(sharedVideoId);
      setUrl(`https://www.youtube.com/watch?v=${sharedVideoId}`);
      setIsSharedLink(true);
    }
  }, [videoId]);

  interface SummaryParams {
    videoId: string;
    forceRefresh?: boolean;
  }

  // Fetch video data when videoId is set
  const {
    data: videoData,
    isLoading: isLoadingVideo,
    error: videoError,
    refetch: refetchVideo,
  } = useQuery<VideoData>({
    queryKey: ["/api/youtube/video", videoId],
    enabled: !!videoId,
  });

  // Mutation for creating/updating analysis
  const summarizeMutation = useMutation({
    mutationFn: async ({ videoId, forceRefresh = false }: SummaryParams) => {
      const response = await fetch("/api/youtube/summarize", {
        method: "POST",
        body: JSON.stringify({ videoId, forceRefresh }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch video analysis
      queryClient.invalidateQueries({ queryKey: ["/api/youtube/analysis"] });
      setManualRetryMode(false);
    },
    onError: (error: Error) => {
      console.error("Error generating summary:", error);
      setManualRetryMode(true);
      toast({
        title: "Analysis Failed",
        description: "Unable to generate analysis. You can try refreshing the analysis manually.",
        variant: "destructive",
      });
    },
  });

  // Query for analysis data
  const {
    data: analysisData,
    isLoading: isLoadingAnalysis,
    error: analysisError,
  } = useQuery<VideoAnalysis>({
    queryKey: ["/api/youtube/analysis", videoId],
    enabled: !!videoId && !!videoData,
    retry: false, // Don't retry on 404 - it's expected for new videos
    meta: {
      // Handle 404 as a normal case, not an error
      errorBoundary: false,
    },
  });

  const handleAnalyze = async (inputUrl: string) => {
    const extractedVideoId = extractVideoId(inputUrl);
    if (!extractedVideoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive",
      });
      return;
    }

    setUrl(inputUrl);
    setVideoId(extractedVideoId);
    setManualRetryMode(false);
    setIsSharedLink(false); // Reset shared link flag for new analysis
  };

  const handleRefreshAnalysis = () => {
    if (videoId) {
      summarizeMutation.mutate({ videoId, forceRefresh: true });
    }
  };

  const isLoading = isLoadingVideo || summarizeMutation.isPending;
  const hasVideoData = !!videoData;
  const hasAnalysisData = !!analysisData;
  const isCachedAnalysis = hasAnalysisData && !summarizeMutation.isPending;

  // Auto-trigger analysis when we have video data but no analysis (only for new analysis, not shared links)
  React.useEffect(() => {
    if (hasVideoData && !hasAnalysisData && !isLoadingAnalysis && !manualRetryMode && !isSharedLink) {
      // Check if the error is a 404 (no analysis found) - this is normal for new videos
      const is404Error = analysisError && (analysisError as any)?.status === 404;
      const shouldTriggerAnalysis = !analysisError || is404Error;
      
      if (shouldTriggerAnalysis) {
        summarizeMutation.mutate({ videoId: videoId! });
      }
    }
  }, [hasVideoData, hasAnalysisData, isLoadingAnalysis, analysisError, manualRetryMode, videoId, isSharedLink]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Analyze YouTube Comments
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get AI-powered insights from YouTube video comments. Discover sentiment patterns, 
              key discussion points, and comprehensive analysis.
            </p>
          </div>

          {/* URL Input Form - Hide for shared links */}
          {!isSharedLink && (
            <div className="mb-8">
              <URLInputForm onSubmit={handleAnalyze} />
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LoadingState />}

          {/* Error State for video loading */}
          {videoError && !isLoading && (
            <ErrorState
              errorMessage={(videoError as Error)?.message || "Failed to load video data"}
              onTryAgain={() => refetchVideo()}
            />
          )}

          {/* Error State for analysis - Don't show 404 errors as they're expected for new videos */}
          {analysisError && hasVideoData && !isLoading && (analysisError as any)?.status !== 404 && (
            <ErrorState
              errorMessage="Failed to generate analysis"
              onTryAgain={handleRefreshAnalysis}
            />
          )}

          {/* Results Section */}
          {hasVideoData && hasAnalysisData && !isLoading && (
            <ResultsSection
              videoData={videoData}
              analysisData={analysisData}
              isCachedAnalysis={isCachedAnalysis}
              isRefreshing={summarizeMutation.isPending}
              onRefreshAnalysis={handleRefreshAnalysis}
            />
          )}

          {/* Video data loaded but no analysis yet */}
          {hasVideoData && !hasAnalysisData && !isLoading && !analysisError && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Generating analysis...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!videoId && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1-1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Analyze
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter a YouTube video URL above to get started with comment analysis.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}