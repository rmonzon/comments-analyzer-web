import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResultsSection from "@/components/ResultsSection";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { VideoData, VideoAnalysis } from "@shared/types";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Seo from "@/components/Seo";

export default function SharedAnalysis() {
  const [, setLocation] = useLocation();
  const [, routeParams] = useRoute("/analysis/:videoId");
  const [videoId, setVideoId] = useState<string | null>(null);
  const { toast } = useToast();

  // Resolve the videoId from the canonical /analysis/:videoId path, falling
  // back to the legacy /shared?id= query param (which we 301-style redirect to
  // the canonical URL so only one URL gets indexed).
  useEffect(() => {
    const routeId = routeParams?.videoId;
    if (routeId) {
      setVideoId(routeId);
      return;
    }

    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      setLocation(`/analysis/${id}`, { replace: true });
      return;
    }

    toast({
      title: "Missing Video ID",
      description: "No video ID was provided in the URL.",
      variant: "destructive",
    });
    setLocation("/");
  }, [routeParams?.videoId, setLocation, toast]);

  // Fetch video data
  const {
    data: videoData,
    isLoading: isVideoLoading,
    isError: isVideoError,
    error: videoError,
  } = useQuery<VideoData>({
    queryKey: ["/api/youtube/video", videoId],
    enabled: !!videoId,
  });

  // Fetch analysis data using single endpoint
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isError: isAnalysisError,
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
        const error = await response.json();
        throw new Error(error.message || "Failed to get analysis");
      }
      
      return response.json();
    },
    enabled: !!videoId,
  });

  const isLoading = isVideoLoading || isAnalysisLoading;
  const isError = isVideoError || isAnalysisError;
  const errorMessage =
    videoError?.toString() ||
    analysisError?.toString() ||
    "An unexpected error occurred";

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleRefreshAnalysis = () => {
    if (videoId) {
      // Redirect to the home page with the video ID for a fresh analysis
      setLocation(`/?analyze=${videoId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-roboto bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-200">
      <Seo
        title={
          videoData?.title
            ? `${videoData.title} — YouTube Comment Analysis`
            : "Shared YouTube Analysis - YouTube Comments Analyzer"
        }
        description={
          videoData?.title
            ? `AI analysis of YouTube comments on "${videoData.title}" — sentiment breakdown, key discussion themes, and a summary of viewer reactions.`
            : "View an AI analysis of a YouTube video's comments, including sentiment breakdown and key insights."
        }
        path={videoId ? `/analysis/${videoId}` : undefined}
        image={videoData?.thumbnail}
        type="article"
        noindex={!videoId}
      />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Shared YouTube Analysis</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back Home
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleRefreshAnalysis}
                className="flex items-center gap-1 text-youtube-blue border-youtube-blue hover:bg-youtube-blue/10"
              >
                <RefreshCw className="w-4 h-4" />
                Fresh Analysis
              </Button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4">
            Viewing a previously generated analysis. This analysis is cached and permanently available at this link.
          </p>
        </div>

        {isLoading && (
          <LoadingState progress={50} />
        )}

        {isError && !isLoading && (
          <ErrorState 
            errorMessage={errorMessage} 
            onTryAgain={handleGoHome}
          />
        )}

        {videoData && analysisData && !isLoading && !isError && (
          <div>
            <ResultsSection
              videoData={videoData}
              analysisData={analysisData}
              isCachedAnalysis={true}
              onRefreshAnalysis={handleRefreshAnalysis}
            />
            
            <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Share this analysis</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Copied!",
                      description: "Link copied to clipboard",
                    });
                  }}
                  className="px-4 py-2 bg-youtube-blue text-white rounded hover:bg-blue-700"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}