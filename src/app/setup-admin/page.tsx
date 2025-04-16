"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check } from "lucide-react";

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const setupAdmin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Try the new endpoint first
      const response = await fetch("/api/admin/create-admin");
      const data = await response.json();

      if (!response.ok) {
        // Fall back to the old endpoint
        const fallbackResponse = await fetch("/api/admin/setup-admin");
        const fallbackData = await fallbackResponse.json();

        if (!fallbackResponse.ok) {
          throw new Error(fallbackData.error || "Failed to setup admin user");
        }

        setSuccess(fallbackData.message || "Admin setup complete!");
      } else {
        setSuccess(data.message || "Admin setup complete!");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Setup Admin User
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div>
              <h3 className="font-medium text-blue-700">Admin Credentials</h3>
              <p className="text-blue-600 text-sm mt-1">
                Email: <strong>admin@genbi.com</strong>
                <br />
                Password: <strong>test12345</strong>
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Click the button below to create or update the admin user with the
          credentials above. This will ensure you can log in with these
          credentials to access all admin features.
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-start mb-4">
            <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <Button
          onClick={setupAdmin}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Setting Up Admin...
            </>
          ) : (
            "Setup Admin User"
          )}
        </Button>

        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/sign-in")}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
