import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Infinity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UsageData {
  plan: string;
  monthlyAnalysisCount: number;
  limit: number | null;
  canAnalyze: boolean;
  resetDate: string | null;
}

export default function UsageIndicator() {
  const { data: usage, isLoading } = useQuery<UsageData>({
    queryKey: ["/api/user/usage"],
  });

  if (isLoading) {
    return (
      <Card className="mb-6" data-testid="usage-indicator-loading">
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const isPaidPlan = usage.plan !== "free";
  const progressPercentage = usage.limit
    ? (usage.monthlyAnalysisCount / usage.limit) * 100
    : 0;

  const getResetText = () => {
    if (!usage.resetDate) return null;
    const resetDate = new Date(usage.resetDate);
    return formatDistanceToNow(resetDate, { addSuffix: true });
  };

  return (
    <Card 
      className="mb-6 border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
      data-testid="usage-indicator"
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Monthly Usage
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              {usage.plan === "free" ? "Free" : usage.plan === "starter" ? "Starter" : "Pro"}
            </span>
          </div>
          
          {isPaidPlan ? (
            <div 
              className="flex items-center gap-1.5 text-green-600 dark:text-green-400"
              data-testid="unlimited-badge"
            >
              <Infinity className="w-4 h-4" />
              <span className="text-sm font-semibold">Unlimited</span>
            </div>
          ) : (
            <div className="text-right" data-testid="usage-count">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {usage.monthlyAnalysisCount}
                <span className="text-gray-500 dark:text-gray-400">/{usage.limit}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">analyses used</p>
            </div>
          )}
        </div>

        {!isPaidPlan && usage.limit && (
          <>
            <Progress 
              value={progressPercentage} 
              className="h-2 mb-2"
              data-testid="usage-progress"
            />
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>
                {usage.limit - usage.monthlyAnalysisCount} remaining
              </span>
              {usage.resetDate && (
                <div className="flex items-center gap-1" data-testid="reset-date">
                  <Calendar className="w-3 h-3" />
                  <span>Resets {getResetText()}</span>
                </div>
              )}
            </div>
          </>
        )}

        {isPaidPlan && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            You have unlimited video analyses on your {usage.plan} plan
          </p>
        )}
      </CardContent>
    </Card>
  );
}
