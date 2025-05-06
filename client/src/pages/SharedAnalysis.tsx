import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { VideoData, VideoAnalysis } from "@shared/types";
import { getQueryFn } from "@/lib/queryClient";
import ResultsSection from "@/components/ResultsSection";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

type SharedAnalysisData = {
  shareId: string;
  videoData: VideoData;
  analysisData: VideoAnalysis;
  sharedBy: {
    username: string;
  } | null;
  createdAt: string;
};

export default function SharedAnalysis() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const shareId = params.shareId;

  const {
    data: sharedData,
    isLoading,
    isError,
    error
  } = useQuery<SharedAnalysisData, Error>({
    queryKey: ["/api/shared/analysis", shareId],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!shareId,
  });

  const handleTryAgain = () => {
    // Refresh the page to retry
    window.location.reload();
  };

  if (!shareId) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Invalid Share URL</h1>
        <p className="mb-4">
          The share URL appears to be invalid. Please check that you have the correct link.
        </p>
        <Button onClick={() => setLocation("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Home
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4 flex items-center">
          <Button variant="outline" className="mr-2" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Shared YouTube Comment Analysis</h1>
        </div>
        <div className="py-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (isError || !sharedData) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4 flex items-center">
          <Button variant="outline" className="mr-2" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Shared YouTube Comment Analysis</h1>
        </div>
        <ErrorState 
          errorMessage={error?.message || "This shared analysis doesn't exist or has been removed."}
          onTryAgain={handleTryAgain}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <Button variant="outline" className="mr-2" onClick={() => setLocation("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Shared YouTube Comment Analysis</h1>
          </div>
          {sharedData.sharedBy && (
            <div className="text-sm text-muted-foreground">
              Shared by <span className="font-medium">{sharedData.sharedBy.username}</span> on{" "}
              {new Date(sharedData.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>

        <ResultsSection
          videoData={sharedData.videoData}
          analysisData={sharedData.analysisData}
          isCachedAnalysis={true}
          isSharedView={true}
        />
      </main>
      <Footer />
    </div>
  );
}