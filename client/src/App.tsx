import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Analysis from "@/pages/Analysis";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import About from "@/pages/About";
import SharedAnalysis from "@/pages/SharedAnalysis";
import FAQ from "@/pages/FAQ";
import VideosList from "@/pages/VideosList";
import Pricing from "@/pages/Pricing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./index.css";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/analyze" component={Analysis} />
      <Route path="/history" component={VideosList} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/shared" component={SharedAnalysis} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/about" component={About} />
      <Route path="/faq" component={FAQ} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Header />
          <main className="flex-1">
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/faq" component={FAQ} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route path="/terms" component={TermsOfService} />
            <Route path="/analysis/:videoId" component={Analysis} />
            <Route path="/shared/:shareId" component={SharedAnalysis} />
            <Route path="/history" component={VideosList} />
            <Route component={NotFound} />
          </main>
          <Footer />
          <Toaster />
        </Router>
      </QueryClientProvider>
    </div>
  );
}

export default App;
