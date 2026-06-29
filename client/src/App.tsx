import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./index.css";

// Home is eager (it's the landing page / LCP). Every other route is split into
// its own chunk so the homepage doesn't ship their code in the initial bundle.
const Analysis = lazy(() => import("@/pages/Analysis"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const About = lazy(() => import("@/pages/About"));
const SharedAnalysis = lazy(() => import("@/pages/SharedAnalysis"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const VideosList = lazy(() => import("@/pages/VideosList"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const ExtensionAuth = lazy(() => import("@/pages/ExtensionAuth"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/analyze" component={Analysis} />
        <Route path="/history" component={VideosList} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/analysis/:videoId" component={SharedAnalysis} />
        <Route path="/shared" component={SharedAnalysis} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/about" component={About} />
        <Route path="/faq" component={FAQ} />
        <Route path="/extension-auth" component={ExtensionAuth} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
