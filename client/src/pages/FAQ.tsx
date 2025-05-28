import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FAQSection from "@/components/FAQSection";

export default function FAQ() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="outline" className="mb-6" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          Frequently Asked Questions - YouTube Comment Analysis
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Find answers to common questions about our AI-powered YouTube comment analysis tool, sentiment analysis features, and how to get the most insights from video comments.
        </p>
      </div>

      <FAQSection />
    </div>
  );
}