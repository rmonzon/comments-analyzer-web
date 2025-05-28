import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IntroSection from "@/components/IntroSection";
import URLInputForm from "@/components/URLInputForm";
import ResultsSection from "@/components/ResultsSection";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import AnalyzedVideosList from "@/components/AnalyzedVideosList";

import { useToast } from "@/hooks/use-toast";
import { extractVideoId } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Share2, ArrowLeft } from "lucide-react";
import {
  VideoData,
  VideoAnalysis,
} from "@shared/types";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [manualRetryMode, setManualRetryMode] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Handle URL parameters and current route
  useEffect(() => {
    // Check if we're on the history page
    const isHistoryPage = window.location.pathname === "/history";
    if (isHistoryPage) {
      setShowHistory(true);
      setVideoId(null);
      return;
    }
    
    // Handle regular URL parameters
    const params = new URLSearchParams(window.location.search);
    const analysisId = params.get("analyze");
    const videoIdParam = params.get("videoId");
    
    if (analysisId) {
      // Clear the URL parameter without page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Set the video ID to trigger analysis
      setVideoId(analysisId);
      
      // Show notification
      toast({
        title: "Analysis Requested",
        description: `Analyzing video ID: ${analysisId}`,
      });
    } else if (videoIdParam) {
      // Set the video ID but don't clear the URL
      setVideoId(videoIdParam);
    }
  }, [toast, window.location.pathname, window.location.search]);

  const {
    data: videoData,
    isLoading: isVideoLoading,
    isError: isVideoError,
    error: videoError,
    refetch: refetchVideo,
  } = useQuery<VideoData>({
    queryKey: ["/api/youtube/video", videoId],
    enabled: !!videoId,
  });

  const [analysisData, setAnalysisData] = useState<VideoAnalysis | null>(null);
  const [isCachedAnalysis, setIsCachedAnalysis] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Interface for summary params
  interface SummaryParams {
    videoId: string;
    forceRefresh?: boolean;
  }

  const generateSummaryMutation = useMutation<
    VideoAnalysis,
    Error,
    SummaryParams
  >({
    mutationFn: async ({ videoId, forceRefresh = false }) => {
      console.log(
        `Starting summary generation for video ID: ${videoId} (forceRefresh: ${forceRefresh})`,
      );

      if (forceRefresh) {
        setIsRefreshing(true);
      }

      try {
        const response = await apiRequest("POST", "/api/youtube/summarize", {
          videoId,
          forceRefresh,
        });
        console.log("Raw API response:", response);
        const data = await response.json();
        console.log("Parsed data from API:", data);

        // Validate the shape of the data
        if (!data || typeof data !== "object") {
          throw new Error("Invalid response data format");
        }

        // Mark as cached or fresh based on forceRefresh flag or the creation timestamp
        // A fresh analysis will have a timestamp very close to now
        const analysisDate = new Date(data.createdAt);
        const now = new Date();
        const isRecent = now.getTime() - analysisDate.getTime() < 5000; // 5 seconds

        setIsCachedAnalysis(!forceRefresh && !isRecent);
        setIsRefreshing(false);

        return data as VideoAnalysis;
      } catch (error) {
        setIsRefreshing(false);
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
          errorMessage =
            "Video not found or comments unavailable. Please check if the video exists and has public comments.";
        } else if (error.message.includes("No comments available")) {
          errorMessage =
            "No comments available for this video. Please try a different video with more engagement.";
        } else if (
          error.message.includes("exceeded your current quota") ||
          error.message.includes("rate limit") ||
          error.message.includes("insufficient_quota")
        ) {
          errorMessage =
            "OpenAI API quota exceeded. Please try again later or update your API key.";
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
        queryClient.invalidateQueries({ queryKey: ["/api/youtube/video", id] });
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
          generateSummaryMutation.mutate({ videoId });
        } else {
          // If no video data, first fetch it then let the effect trigger the analysis
          console.log("Manual retry - fetching video data first");
          queryClient.invalidateQueries({
            queryKey: ["/api/youtube/video", videoId],
          });
        }
      } else {
        // Standard retry flow - refresh video data and let effect handle analysis
        console.log("Standard retry - refreshing video data");
        queryClient.invalidateQueries({
          queryKey: ["/api/youtube/video", videoId],
        });
      }
    }
  };

  const isLoading = isVideoLoading || generateSummaryMutation.isPending;
  const isError = isVideoError || generateSummaryMutation.isError;
  const errorMessage =
    videoError?.toString() ||
    generateSummaryMutation.error?.message ||
    "An unexpected error occurred";

  // Use the analysis data directly from the mutation or state
  const currentAnalysisData = analysisData || generateSummaryMutation.data;

  // Effect to trigger analysis when video data is loaded
  useEffect(() => {
    // Only auto-generate if we're not in manual retry mode
    if (
      videoId &&
      videoData &&
      !analysisData &&
      !generateSummaryMutation.isPending &&
      !manualRetryMode
    ) {
      console.log("Video data loaded, triggering analysis for:", videoId);
      generateSummaryMutation.mutate({ videoId });
    }
  }, [
    videoId,
    videoData,
    analysisData,
    generateSummaryMutation.isPending,
    manualRetryMode,
  ]);

  return (
    <div className="min-h-screen flex flex-col font-roboto bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-200">
      <Header />
      <main className="flex-grow container mx-auto px-4">
        {showHistory ? (
          <>
            <div className="pt-8 pb-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  setShowHistory(false);
                  // Navigate back to the home page
                  setLocation('/');
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Analyzer
              </Button>
            </div>
            <AnalyzedVideosList />
          </>
        ) : (
          <>
            <IntroSection />
            <URLInputForm onSubmit={handleSubmit} />

            {isLoading && (
              <LoadingState
                progress={generateSummaryMutation.isPending ? 70 : 30}
              />
            )}

            {isError && !isLoading && (
              <ErrorState errorMessage={errorMessage} onTryAgain={handleTryAgain} />
            )}

            {videoData && currentAnalysisData && !isLoading && !isError && (
              <div>
                <div className="mb-6 flex items-center justify-between max-w-4xl mx-auto bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-youtube-blue" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Share this analysis
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Get a permanent link to share
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (videoId) {
                        // Generate a shareable URL
                        const shareUrl = `${window.location.origin}/shared?id=${videoId}`;

                        // Copy to clipboard
                        navigator.clipboard
                          .writeText(shareUrl)
                          .then(() => {
                            toast({
                              title: "Link copied!",
                              description:
                                "Share link has been copied to your clipboard.",
                            });
                          })
                          .catch(() => {
                            toast({
                              title: "Failed to copy",
                              description: "The share link is: " + shareUrl,
                              variant: "destructive",
                            });
                          });
                      }
                    }}
                    className="bg-youtube-blue hover:bg-blue-700 text-white"
                  >
                    Copy Link
                  </Button>
                </div>
                <ResultsSection
                  videoData={videoData}
                  analysisData={currentAnalysisData}
                  isCachedAnalysis={isCachedAnalysis}
                  isRefreshing={isRefreshing}
                  onRefreshAnalysis={
                    videoId
                      ? () => {
                          // Force a refresh of the analysis
                          generateSummaryMutation.mutate({
                            videoId,
                            forceRefresh: true,
                          });
                        }
                      : undefined
                  }
                />
              </div>
            )}


          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
