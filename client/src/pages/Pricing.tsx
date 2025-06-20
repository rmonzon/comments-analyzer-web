import { PricingTable, ClerkLoaded } from "@clerk/clerk-react";

export default function Pricing() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Unlock deeper insights with advanced comment analysis features
            </p>
          </div>
          <ClerkLoaded>
            <PricingTable
              fallback={
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              }
            />
          </ClerkLoaded>
        </div>
      </div>
    </div>
  );
}
