import { useUser, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Define pricing plans according to Clerk's billing structure
const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "month",
    description: "Perfect for getting started with comment analysis",
    features: [
      "Analyze up to 100 comments per video",
      "Basic sentiment analysis",
      "Key discussion points",
      "Share analysis reports",
      "Less powerful AI model analysis",
    ],
    icon: Star,
    popular: false,
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "month",
    description: "Enhanced analysis for content creators and researchers",
    features: [
      "Analyze up to 1,000 comments per video",
      "Advanced sentiment analysis",
      "Detailed topic clustering",
      "Priority processing",
      "Export analysis reports",
      "Email support",
    ],
    icon: Zap,
    popular: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$49",
    period: "month",
    description: "Complete analysis suite for professionals",
    features: [
      "Unlimited comment analysis",
      "Real-time analysis monitoring",
      "Custom analysis parameters",
      "Bulk video processing",
      "API access",
      "Advanced analytics dashboard",
      "Priority support",
    ],
    icon: Crown,
    popular: false,
    cta: "Go Premium",
  },
];

export default function Pricing() {
  const { isSignedIn, user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Fetch user subscription status
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

  const currentTier = subscriptionData?.subscription?.tier || 'free';
  const hasActiveSubscription = subscriptionData?.hasActiveSubscription || false;

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to subscribe to a plan",
        variant: "destructive",
      });
      return;
    }

    if (planId === "free") {
      return; // Free plan doesn't require subscription
    }

    setLoading(planId);

    try {
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "clerk-user-id": user?.id || "",
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const result = await response.json();

      toast({
        title: "Subscription Created",
        description: result.message,
      });

      // In a real Clerk implementation, redirect to checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Unlock deeper insights with advanced comment analysis features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentTier === plan.id;
            const isDowngrade = hasActiveSubscription && (
              (currentTier === "premium" && plan.id !== "premium") ||
              (currentTier === "pro" && plan.id === "free")
            );

            const getButtonText = () => {
              if (loading === plan.id) return "Processing...";
              if (isCurrentPlan) return "Current Plan";
              if (isDowngrade) return "Downgrade";
              if (!isSignedIn && plan.id !== "free") return "Sign In to Subscribe";
              return plan.cta;
            };

            const isButtonDisabled = () => {
              return loading === plan.id || isCurrentPlan || (plan.id === "free" && isSignedIn);
            };

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col h-full ${
                  plan.popular ? 'ring-2 ring-blue-500 shadow-xl' : 'shadow-lg'
                } ${isCurrentPlan ? 'border-green-500 border-2' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      Active
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <Icon className="h-12 w-12 text-blue-500" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      /{plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={`${plan.id}-feature-${index}`} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    {!isSignedIn && plan.id !== "free" ? (
                      <SignInButton mode="modal">
                        <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                          Sign In to Subscribe
                        </Button>
                      </SignInButton>
                    ) : (
                      <Button
                        className="w-full"
                        variant={
                          isCurrentPlan 
                            ? "secondary" 
                            : plan.popular 
                              ? "default" 
                              : "outline"
                        }
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isButtonDisabled()}
                      >
                        {loading === plan.id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          getButtonText()
                        )}
                      </Button>
                    )}
                  </div>
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