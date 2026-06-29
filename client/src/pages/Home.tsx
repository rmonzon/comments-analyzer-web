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

  // Load AdSense only after the first user interaction (or a delayed fallback)
  // so the ad script's execution and any auto-injected ad units stay out of the
  // initial-load window — keeping them from hurting LCP, TBT and CLS.
  useEffect(() => {
    if (document.getElementById("adsbygoogle-js")) return;

    let done = false;
    const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;

    const inject = () => {
      if (done) return;
      done = true;
      events.forEach((e) => window.removeEventListener(e, inject));
      clearTimeout(fallback);

      const script = document.createElement("script");
      script.id = "adsbygoogle-js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8572681182636372";
      document.body.appendChild(script);
    };

    events.forEach((e) =>
      window.addEventListener(e, inject, { once: true, passive: true }),
    );
    // Fallback so ads still load for users who never interact.
    const fallback = setTimeout(inject, 6000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, inject));
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Seo
        title={ROUTE_SEO["/"].title}
        description={ROUTE_SEO["/"].description}
        path="/"
      />
      <IntroSection />
    </div>
  );
}
