import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="outline" className="mb-6" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Last updated: April 29, 2025
        </p>
      </div>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3">Introduction</h2>
          <p>
            Welcome to YouTube Comment Analyzer. These terms of service govern your use
            of our website and services. By accessing or using our platform, you agree
            to be bound by these terms. Please read them carefully.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
          <p>
            By accessing or using YouTube Comment Analyzer, you agree to be bound by these
            Terms of Service and all applicable laws and regulations. If you do not
            agree with any of these terms, you are prohibited from using or accessing
            this site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Description of Service</h2>
          <p>
            YouTube Comment Analyzer provides AI-powered analysis of YouTube video
            comments to generate insights, summaries, and sentiment analysis. This
            service is provided "as is" with no guarantees regarding accuracy,
            completeness, or reliability of the analyses provided.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Use of Service</h2>
          <p>
            You agree to use our service only for lawful purposes and in accordance
            with these terms. You are prohibited from:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>
              Using the service in any way that violates any applicable local,
              state, national, or international law or regulation.
            </li>
            <li>
              Attempting to interfere with, compromise the system integrity or
              security, or decipher any transmissions to or from the servers
              running the service.
            </li>
            <li>
              Using the service for any purpose that is harmful, threatening,
              abusive, harassing, tortious, defamatory, vulgar, obscene,
              libelous, invasive of another's privacy, hateful, or racially,
              ethnically, or otherwise objectionable.
            </li>
            <li>
              Engaging in any automated use of the system, such as using scripts
              to send requests or scraping website content.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">API Usage and Limitations</h2>
          <p>
            Our service uses the YouTube API Services to access and analyze YouTube
            video comments. By using our service, you are also agreeing to be bound
            by the{" "}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              YouTube Terms of Service
            </a>
            . Additionally, Google's{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Privacy Policy
            </a>{" "}
            also applies to this use of YouTube API Services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are
            and will remain the exclusive property of YouTube Comment Analyzer and
            its licensors. The service is protected by copyright, trademark, and
            other laws. Our trademarks and trade dress may not be used in
            connection with any product or service without the prior written
            consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">User Content</h2>
          <p>
            You understand that all information, data, or other materials you
            submit to the site, including YouTube video URLs you input for analysis,
            are your sole responsibility. We do not claim ownership of your content,
            but you grant us a license to use, store, and display your content for
            the purpose of providing our service to you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Disclaimer of Warranties</h2>
          <p>
            The service is provided on an "as is" and "as available" basis without
            any warranties of any kind. We do not guarantee the accuracy,
            completeness, or usefulness of any analyses or information provided
            through our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
          <p>
            In no event shall YouTube Comment Analyzer, nor its directors,
            employees, partners, agents, suppliers, or affiliates, be liable for any
            indirect, incidental, special, consequential, or punitive damages,
            including without limitation, loss of profits, data, use, goodwill, or
            other intangible losses, resulting from your access to or use of or
            inability to access or use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these
            terms at any time. It is your responsibility to check these terms
            periodically for changes. Your continued use of the service following
            the posting of any changes constitutes acceptance of those changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:{" "}
            <a
              href="mailto:terms@ytcommentanalyzer.com"
              className="text-blue-600 dark:text-blue-400"
            >
              terms@ytcommentanalyzer.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}