import { useState } from "react";
import { Crown, ArrowRight, Zap, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function PremiumFeatureInterest() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [commentCount, setCommentCount] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit interest data to the API
      const response = await fetch("/api/premium/register-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          commentCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit interest");
      }

      // Show success message
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Interest Recorded!",
        description:
          "Thanks for your interest in premium features. We'll notify you when they become available.",
      });

      // Reset the form after 3 seconds
      setTimeout(() => {
        setIsDialogOpen(false);
        setIsSubmitted(false);
        setEmail("");
      }, 3000);
    } catch (error) {
      console.error("Error submitting premium interest:", error);
      setIsSubmitting(false);
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit your interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8 mb-4 relative">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5 rounded-lg shadow-lg">
        <div className="bg-white dark:bg-gray-900 rounded-[7px] p-4">
          <div className="flex items-start space-x-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
              <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-1 flex items-center">
                Want to analyze more comments?
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  Coming Soon
                </span>
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Currently limited to <b>100</b> comments per analysis. Let us know if you're interested in analyzing more.
              </p>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    id="premium-interest-trigger"
                    variant="outline"
                    className="text-sm flex items-center hover:text-purple-600 hover:border-purple-300 transition-colors duration-200"
                  >
                    Express Interest <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                      Premium Analysis Features
                    </DialogTitle>
                    <DialogDescription>
                      Help us understand the demand for deeper comment analysis
                      by expressing your interest.
                    </DialogDescription>
                  </DialogHeader>

                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          How many comments would you like to analyze?
                        </label>
                        <div className="flex space-x-4">
                          {[100, 500, 1000, 5000].map((count) => (
                            <button
                              key={count}
                              type="button"
                              className={`px-3 py-1 rounded-full text-sm ${
                                commentCount === count
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                              onClick={() => setCommentCount(count)}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Your email (to notify you when available)
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            <span>Submit Interest</span>
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="py-8 flex flex-col items-center text-center">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
                        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        Thank you for your interest!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        We'll notify you at{" "}
                        <span className="font-medium">{email}</span> when
                        premium features become available.
                      </p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute -right-2 -top-2 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl -z-10"></div>
      <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}
