import React, { useState } from "react";
import VideoInfoCard from "./VideoInfoCard";
import AnalysisTabs from "./AnalysisTabs";
import { VideoData, VideoAnalysis } from "@shared/types";
import { Share2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface ResultsSectionProps {
  videoData: VideoData;
  analysisData: VideoAnalysis;
  isCachedAnalysis?: boolean;
  isRefreshing?: boolean;
  isSharedView?: boolean;
  onRefreshAnalysis?: () => void;
}

export default function ResultsSection({
  videoData,
  analysisData,
  isCachedAnalysis = false,
  isRefreshing = false,
  isSharedView = false,
  onRefreshAnalysis,
}: ResultsSectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  
  // Create a shareable link mutation
  const shareMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/shared/analysis", {
        videoId: videoData.id
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create shared analysis");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      setShareUrl(data.shareUrl);
      toast({
        title: "Analysis shared successfully",
        description: "A unique link has been created for sharing this analysis.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sharing failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleShare = () => {
    if (user) {
      shareMutation.mutate();
    } else {
      toast({
        title: "Authentication required",
        description: "Please sign in to share this analysis.",
        variant: "destructive",
      });
    }
  };
  
  const handleCopyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Share link copied to clipboard!",
          });
        })
        .catch(() => {
          toast({
            title: "Copy failed",
            description: "Failed to copy link. Please try selecting and copying manually.",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <section className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h2 className="text-xl font-bold">Analysis Results</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {isCachedAnalysis && !isSharedView && (
            <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              Using cached analysis
            </span>
          )}
          
          {!isSharedView && onRefreshAnalysis && (
            <button
              onClick={onRefreshAnalysis}
              disabled={isRefreshing}
              className={`px-3 py-1.5 rounded-md text-sm ${
                isRefreshing
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-youtube-blue text-white hover:bg-blue-700"
              }`}
            >
              {isRefreshing ? "Refreshing..." : "Refresh Analysis"}
            </button>
          )}
          
          {!isSharedView && user && (
            <>
              {!shareUrl ? (
                <Button 
                  variant="outline" 
                  onClick={handleShare} 
                  disabled={shareMutation.isPending}
                  className="flex items-center gap-1"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  {shareMutation.isPending ? "Creating share link..." : "Share This Analysis"}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center max-w-xs">
                    <input 
                      type="text" 
                      value={shareUrl} 
                      readOnly 
                      className="pr-20 w-full text-sm border rounded-md py-1.5 px-2 bg-muted"
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute right-0 h-full rounded-l-none" 
                      onClick={handleCopyShareLink}
                    >
                      <Check className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          
          {isSharedView && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" /> This is a shared view of the analysis
            </div>
          )}
        </div>
      </div>
      <VideoInfoCard
        video={videoData}
        commentsAnalyzed={analysisData.commentsAnalyzed}
      />
      <AnalysisTabs comments={videoData.comments} analysis={analysisData} />
    </section>
  );
}
