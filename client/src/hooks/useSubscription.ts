import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";

interface SubscriptionData {
  hasActiveSubscription: boolean;
  subscription: {
    tier: string;
    status: string;
    currentPeriodEnd: string;
  } | null;
}

export function useSubscription() {
  const { user, isSignedIn } = useUser();

  const { data: subscriptionData, isLoading, error } = useQuery<SubscriptionData>({
    queryKey: ['/api/subscription/status', user?.id],
    enabled: isSignedIn && !!user?.id,
    queryFn: async () => {
      const response = await fetch('/api/subscription/status', {
        headers: {
          'clerk-user-id': user?.id || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const tier = subscriptionData?.subscription?.tier || 'free';
  const hasActiveSubscription = subscriptionData?.hasActiveSubscription || false;

  // Define usage limits based on tier
  const getUsageLimits = () => {
    switch (tier) {
      case 'pro':
        return {
          maxCommentsPerVideo: 1000,
          hasAdvancedAnalytics: true,
          hasExportFeature: true,
          hasPrioritySupport: true,
          hasAPI: false,
        };
      case 'premium':
        return {
          maxCommentsPerVideo: -1, // unlimited
          hasAdvancedAnalytics: true,
          hasExportFeature: true,
          hasPrioritySupport: true,
          hasAPI: true,
        };
      default: // free
        return {
          maxCommentsPerVideo: 100,
          hasAdvancedAnalytics: false,
          hasExportFeature: false,
          hasPrioritySupport: false,
          hasAPI: false,
        };
    }
  };

  const canAnalyzeVideo = (commentCount: number) => {
    const limits = getUsageLimits();
    return limits.maxCommentsPerVideo === -1 || commentCount <= limits.maxCommentsPerVideo;
  };

  const getUpgradeMessage = (requestedComments: number) => {
    const limits = getUsageLimits();
    
    if (tier === 'free' && requestedComments > limits.maxCommentsPerVideo) {
      return `Free plan allows analysis of up to ${limits.maxCommentsPerVideo} comments. Upgrade to Pro for up to 1,000 comments or Premium for unlimited analysis.`;
    }
    
    if (tier === 'pro' && requestedComments > limits.maxCommentsPerVideo) {
      return `Pro plan allows analysis of up to ${limits.maxCommentsPerVideo} comments. Upgrade to Premium for unlimited analysis.`;
    }
    
    return null;
  };

  return {
    tier,
    hasActiveSubscription,
    isLoading,
    error,
    subscription: subscriptionData?.subscription,
    limits: getUsageLimits(),
    canAnalyzeVideo,
    getUpgradeMessage,
  };
}