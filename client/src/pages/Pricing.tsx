import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<any>;
  buttonText: string;
  color: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for getting started with comment analysis",
    features: [
      "Analyze up to 100 comments per video",
      "Basic sentiment analysis",
      "Key discussion points",
      "Standard processing speed",
      "Community support"
    ],
    icon: Star,
    buttonText: "Get Started",
    color: "gray"
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    period: "month",
    description: "Enhanced analysis for content creators and researchers",
    features: [
      "Analyze up to 1,000 comments per video",
      "Advanced sentiment analysis",
      "Detailed topic clustering",
      "Priority processing",
      "Export analysis reports",
      "Email support"
    ],
    popular: true,
    icon: Zap,
    buttonText: "Upgrade to Pro",
    color: "blue"
  },
  {
    id: "premium",
    name: "Premium",
    price: 49,
    period: "month",
    description: "Complete analysis suite for professionals",
    features: [
      "Unlimited comment analysis",
      "Real-time analysis monitoring",
      "Custom analysis parameters",
      "Bulk video processing",
      "API access",
      "Advanced analytics dashboard",
      "Priority support"
    ],
    icon: Crown,
    buttonText: "Go Premium",
    color: "purple"
  }
];

export default function Pricing() {
  const { isSignedIn, user } = useUser();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  // Get subscription status
  const { data: subscriptionData } = useQuery({
    queryKey: ['/api/subscription/status'],
    enabled: isSignedIn,
    queryFn: async () => {
      const response = await fetch('/api/subscription/status', {
        headers: {
          'clerk-user-id': user?.id || ''
        }
      });
      return response.json();
    }
  });

  // Create subscription mutation
  const createSubscription = useMutation({
    mutationFn: async ({ tier }: { tier: string }) => {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'clerk-user-id': user?.id || ''
        },
        body: JSON.stringify({ tier })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Created",
        description: `Successfully upgraded to ${data.tier} plan!`,
      });
      setLoadingTier(null);
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
      setLoadingTier(null);
    }
  });

  const handleSubscribe = async (tier: PricingTier) => {
    if (!isSignedIn) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive",
      });
      return;
    }

    if (tier.id === "free") return;

    setLoadingTier(tier.id);
    createSubscription.mutate({ tier: tier.id });
  };

  const currentTier = (subscriptionData as any)?.subscription?.tier || "free";
  const hasActiveSubscription = (subscriptionData as any)?.hasActiveSubscription || false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Unlock deeper insights with advanced comment analysis features
          </p>
          {hasActiveSubscription && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            const isCurrentTier = currentTier === tier.id;
            const isDisabled = hasActiveSubscription && (
              (currentTier === "premium") || 
              (currentTier === "pro" && tier.id === "free")
            );

            return (
              <Card 
                key={tier.id} 
                className={`relative ${tier.popular ? 'ring-2 ring-blue-500 shadow-xl' : 'shadow-lg'} ${
                  isCurrentTier ? 'border-green-500' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <Icon className={`h-12 w-12 text-${tier.color}-500`} />
                  </div>
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {tier.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${tier.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      /{tier.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(tier)}
                    disabled={isCurrentTier || isDisabled || loadingTier === tier.id}
                  >
                    {loadingTier === tier.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Processing...
                      </div>
                    ) : isCurrentTier ? (
                      "Current Plan"
                    ) : isDisabled ? (
                      "Downgrade Not Available"
                    ) : (
                      tier.buttonText
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            All plans include our core comment analysis features with no setup fees.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need a custom solution? Contact us for enterprise pricing.
          </p>
        </div>
      </div>
    </div>
  );
}