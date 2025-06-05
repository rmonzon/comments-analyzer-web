import React, { useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IntroSection from "@/components/IntroSection";

export default function Home() {
  const [, setLocation] = useLocation();

  // Handle shared analysis links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const analysisId = params.get("analyze");
    const videoId = params.get("videoId");
    
    if (analysisId || videoId) {
      // Redirect to analysis page with the video ID, keeping the parameter
      const targetVideoId = analysisId || videoId;
      setLocation(`/analyze?videoId=${targetVideoId}`);
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">      
      <IntroSection />      
    </div>
  );
}