import React, { useEffect } from "react";
import { useLocation } from "wouter";
import IntroSection from "@/components/IntroSection";
import Seo from "@/components/Seo";
import { ROUTE_SEO } from "@shared/seo";

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
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Seo
        title={ROUTE_SEO["/"].title}
        description={ROUTE_SEO["/"].description}
        path="/"
      />
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8572681182636372"
        crossOrigin="anonymous"
      ></script>
      <IntroSection />
    </div>
  );
}
