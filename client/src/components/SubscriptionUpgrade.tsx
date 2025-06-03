import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface SubscriptionUpgradeProps {
  currentTier: string;
  message: string;
  requestedComments?: number;
}

export default function SubscriptionUpgrade({ 
  currentTier, 
  message, 
  requestedComments 
}: SubscriptionUpgradeProps) {
  const getRecommendedTier = () => {
    if (!requestedComments) return "pro";
    
    if (requestedComments <= 1000) {
      return "pro";
    } else {
      return "premium";
    }
  };

  const recommendedTier = getRecommendedTier();

  const tierInfo = {
    pro: {
      name: "Pro",
      price: "$19/month",
      icon: Zap,
      color: "blue",
      features: [
        "Up to 1,000 comments per video",
        "Advanced sentiment analysis",
        "Priority processing",
        "Export reports"
      ]
    },
    premium: {
      name: "Premium", 
      price: "$49/month",
      icon: Crown,
      color: "purple",
      features: [
        "Unlimited comment analysis",
        "Real-time monitoring",
        "API access",
        "Custom parameters"
      ]
    }
  };

  const info = tierInfo[recommendedTier as keyof typeof tierInfo];
  const Icon = info.icon;

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className={`h-8 w-8 text-${info.color}-500`} />
          <div>
            <CardTitle className="text-lg">Upgrade Required</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {message}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">{info.name}</h3>
            <Badge variant="outline" className={`text-${info.color}-600 border-${info.color}-600`}>
              Recommended
            </Badge>
          </div>
          
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {info.price}
          </p>
          
          <ul className="space-y-2 mb-4">
            {info.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <ArrowRight className="h-4 w-4 text-green-500 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
          
          <Link href="/pricing">
            <Button className="w-full" size="sm">
              View Pricing Plans
            </Button>
          </Link>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Your current plan: <strong>{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</strong>
        </p>
      </CardContent>
    </Card>
  );
}