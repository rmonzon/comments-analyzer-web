import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="outline" className="mb-6" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Last updated: April 29, 2025
        </p>
      </div>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3">Introduction</h2>
          <p>
            Welcome to YouTube Comment Analyzer. We respect your privacy and are
            committed to protecting your personal data. This privacy policy will
            inform you about how we look after your personal data when you visit
            our website and tell you about your privacy rights and how the law
            protects you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">The Data We Collect</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal
            data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>
              <strong>Identity Data</strong> includes email address when you
              express interest in our premium features.
            </li>
            <li>
              <strong>Technical Data</strong> includes internet protocol (IP)
              address, browser type and version, time zone setting and location,
              browser plug-in types and versions, operating system and platform,
              and other technology on the devices you use to access this
              website.
            </li>
            <li>
              <strong>Usage Data</strong> includes information about how you use
              our website and services, including the YouTube videos you
              analyze.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">How We Use Your Data</h2>
          <p>We will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>
              To provide you with the services you have requested, such as
              analyzing YouTube video comments.
            </li>
            <li>To notify you about changes to our service or terms.</li>
            <li>
              To improve our website, products/services, marketing, or customer
              relationships.
            </li>
            <li>
              To contact you about premium features if you have expressed
              interest.
            </li>
            <li>
              To use data analytics to improve our website, products/services,
              marketing, customer relationships, and experiences.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">YouTube API Services</h2>
          <p>
            Our service uses the YouTube API Services to access and analyze
            YouTube video comments. By using our service, you are also agreeing
            to be bound by the{" "}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              YouTube Terms of Service
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your
            personal data from being accidentally lost, used, or accessed in an
            unauthorized way, altered, or disclosed. In addition, we limit
            access to your personal data to those employees, agents,
            contractors, and other third parties who have a business need to
            know.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
          <p>
            We will only retain your personal data for as long as necessary to
            fulfill the purposes we collected it for, including for the purposes
            of satisfying any legal, accounting, or reporting requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection
            laws in relation to your personal data, including the right to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Request access to your personal data.</li>
            <li>Request correction of your personal data.</li>
            <li>Request erasure of your personal data.</li>
            <li>Object to processing of your personal data.</li>
            <li>Request restriction of processing your personal data.</li>
            <li>Request transfer of your personal data.</li>
            <li>Right to withdraw consent.</li>
          </ul>
          <p className="mt-4">
            If you wish to exercise any of these rights, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy
            practices, please contact us at:{" "}
            <a
              href="mailto:privacy@commentsanalyzer.info"
              className="text-blue-600 dark:text-blue-400"
            >
              privacy@commentsanalyzer.info
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
