import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ExternalLink, Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SharedAnalysis {
  shareId: string;
  videoId: string;
  userId: number;
  username: string;
  createdAt: string;
  views: number;
  shareUrl?: string;
}

export default function MySharedAnalyses() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: sharedAnalyses,
    isLoading,
    isError,
    error
  } = useQuery<SharedAnalysis[], Error>({
    queryKey: ["/api/user/shared-analyses"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });
  
  const handleCopyLink = (shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({
          title: "Success",
          description: "Share link copied to clipboard!",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Please select and copy the link manually.",
          variant: "destructive",
        });
      });
  };
  
  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading your shared analyses...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-semibold">Error loading shared analyses</p>
        <p className="text-sm">{error?.message || "An unexpected error occurred"}</p>
      </div>
    );
  }
  
  if (!sharedAnalyses || sharedAnalyses.length === 0) {
    return (
      <div className="p-6 text-center border rounded-lg bg-muted/50">
        <Share2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-medium mb-1">No shared analyses yet</h3>
        <p className="text-sm text-muted-foreground">
          When you share analysis results, they will appear here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Shared Analyses</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {sharedAnalyses.map((shared) => (
          <div key={shared.shareId} className="border rounded-lg p-4 bg-card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm text-muted-foreground">
                  Shared on {new Date(shared.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {shared.views} {shared.views === 1 ? 'view' : 'views'}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => shared.shareUrl && handleCopyLink(shared.shareUrl)}
                title="Copy share link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center mt-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mr-2"
              >
                <Link to={`/shared/${shared.shareId}`}>
                  <ExternalLink className="h-3 w-3 mr-1" /> View
                </Link>
              </Button>
              
              <div className="text-xs truncate flex-1 bg-muted p-2 rounded">
                {shared.shareUrl || `/shared/${shared.shareId}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}