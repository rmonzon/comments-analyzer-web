import React from "react";
import VideoInfoCard from "./VideoInfoCard";
import AnalysisTabs from "./AnalysisTabs";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VideoData, VideoAnalysis } from "@shared/types";

interface ResultsSectionProps {
  videoData: VideoData;
  analysisData: VideoAnalysis;
  isCachedAnalysis?: boolean;
  isRefreshing?: boolean;
  onRefreshAnalysis?: () => void;
}

export default function ResultsSection({
  videoData,
  analysisData,
  isCachedAnalysis = false,
  isRefreshing = false,
  onRefreshAnalysis,
}: ResultsSectionProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?analyze=${videoData.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Share link",
        description: shareUrl,
        variant: "default",
      });
    }
  };

  return (
    <section className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Analysis Results</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          {isCachedAnalysis && (
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              Using cached analysis
            </span>
          )}
          {onRefreshAnalysis && (
            <button
              onClick={onRefreshAnalysis}
              disabled={isRefreshing}
              className={`px-3 py-1 rounded text-sm ${
                isRefreshing
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-youtube-blue text-white hover:bg-blue-700"
              }`}
            >
              {isRefreshing ? "Refreshing..." : "Refresh Analysis"}
            </button>
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
