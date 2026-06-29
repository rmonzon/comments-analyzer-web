import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { ROUTE_SEO } from "@shared/seo";
import URLInputForm from "@/components/URLInputForm";
import ResultsSection from "@/components/ResultsSection";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import UsageIndicator from "@/components/UsageIndicator";
import SubscriptionUpgrade from "@/components/SubscriptionUpgrade";

import { useToast } from "@/hooks/use-toast";
import { extractVideoId } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { VideoData, VideoAnalysis } from "@shared/types";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function Analysis() {
  const [url, setUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [manualRetryMode, setManualRetryMode] = useState<boolean>(false);
  const [isSharedLink, setIsSharedLink] = useState<boolean>(false);
  const { toast } = useToast();
  const { isLoaded, isSignedIn } = useAuth();

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
        const errorData = await response.json();
        const error: any = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch analysis data
      queryClient.invalidateQueries({ queryKey: ["/api/youtube/summarize"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/usage"] });
      setManualRetryMode(false);
    },
    onError: (error: any) => {
      console.error("Error generating summary:", error);
      
      if (error.status === 401 || error.data?.requiresAuth) {
        toast({
          title: "Sign In Required",
          description: "Please sign in to analyze videos.",
          variant: "destructive",
        });
      } else if (error.status === 403 || error.data?.limitReached) {
        toast({
          title: "Limit Reached",
          description: error.message || "You've reached your monthly analysis limit.",
          variant: "destructive",
        });
      } else {
        setManualRetryMode(true);
        toast({
          title: "Analysis Failed",
          description: error.message || "Unable to generate analysis.",
          variant: "destructive",
        });
      }
    },
  });

  // Single endpoint for getting or creating analysis
  const {
    data: analysisData,
    isLoading: isLoadingAnalysis,
    error: analysisError,
  } = useQuery<VideoAnalysis>({
    queryKey: ["/api/youtube/summarize", videoId],
    queryFn: async () => {
      const response = await fetch("/api/youtube/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, forceRefresh: false }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error: any = new Error(errorData.message || "Failed to get analysis");
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return response.json();
    },
    enabled: !!videoId && !!videoData && isSignedIn,
    retry: false,
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

  const isLoading =
    isLoadingVideo || isLoadingAnalysis || summarizeMutation.isPending;
  const hasVideoData = !!videoData;
  const hasAnalysisData = !!analysisData;

  // Use the fromCache flag from the backend response
  const isCachedAnalysis = hasAnalysisData && analysisData.fromCache === true;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Seo
        title={ROUTE_SEO["/analyze"].title}
        description={ROUTE_SEO["/analyze"].description}
        path="/analyze"
      />
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8572681182636372"
        crossOrigin="anonymous"
      ></script>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Analyze YouTube Comments
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get AI-powered insights from YouTube video comments. Discover
              sentiment patterns, key discussion points, and comprehensive
              analysis.
            </p>
          </div>

          {/* Authentication Check */}
          {isLoaded && !isSignedIn && (
            <Card className="mb-6 border-blue-200 dark:border-blue-800" data-testid="sign-in-prompt">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <CardTitle>Sign In Required</CardTitle>
                    <CardDescription>
                      Please sign in to analyze YouTube videos
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create a free account to analyze up to 5 videos per month. Upgrade for unlimited analyses.
                </p>
                <SignInButton mode="modal">
                  <Button className="w-full sm:w-auto" data-testid="button-sign-in">
                    Sign In to Get Started
                  </Button>
                </SignInButton>
              </CardContent>
            </Card>
          )}

          {/* Usage Indicator - Show for signed in users */}
          {isLoaded && isSignedIn && <UsageIndicator />}

          {/* Show upgrade prompt if limit reached */}
          {isLoaded && isSignedIn && analysisError && (analysisError as any)?.status === 403 && (
            <SubscriptionUpgrade
              currentTier="free"
              message="You've reached your monthly analysis limit of 5 videos. Upgrade to continue analyzing."
            />
          )}

          {/* URL Input Form - Hide for shared links or if not signed in */}
          {!isSharedLink && isLoaded && isSignedIn && (
            <div className="mb-8">
              <URLInputForm onSubmit={handleAnalyze} />
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LoadingState />}

          {/* Error State for video loading */}
          {videoError && !isLoading && (
            <ErrorState
              errorMessage={
                (videoError as Error)?.message || "Failed to load video data"
              }
              onTryAgain={() => refetchVideo()}
            />
          )}

          {/* Error State for analysis */}
          {analysisError && hasVideoData && !isLoading && (
            <ErrorState
              errorMessage={
                (analysisError as any)?.message || "Failed to fetch analysis"
              }
              onTryAgain={() => {
                // For "Analysis not found" errors, trigger new analysis
                if (
                  (analysisError as any)?.message?.includes(
                    "Analysis not found",
                  )
                ) {
                  handleRefreshAnalysis();
                } else {
                  // For other errors, refetch the analysis query
                  window.location.reload();
                }
              }}
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
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1-1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Analyze
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter a YouTube video URL above to get started with comment
                analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
