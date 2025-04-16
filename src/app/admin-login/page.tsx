"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Key } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // First, set up the admin user
  useEffect(() => {
    const setupAdmin = async () => {
      try {
        // Try the new endpoint first
        const response = await fetch("/api/admin/create-admin");
        const data = await response.json();

        if (!response.ok) {
          // Fall back to the old endpoint
          const fallbackResponse = await fetch("/api/admin/setup-admin");
          const fallbackData = await fallbackResponse.json();

          if (!fallbackResponse.ok) {
            setError(fallbackData.error || "Failed to set up admin user");
          } else {
            setSuccess("Admin user is ready. Click the button to log in.");
          }
        } else {
          setSuccess("Admin user is ready. Click the button to log in.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      }
    };

    setupAdmin();
  }, []);

  const handleDirectLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try the force login endpoint which is simpler and more direct
      window.location.href = "/api/admin/force-login";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Direct Login
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Key className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
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

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handleDirectLogin}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Logging in...
            </>
          ) : (
            "Login as Admin"
          )}
        </Button>

        <div className="mt-4 flex flex-col space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/sign-in")}
          >
            Go to Regular Sign In
          </Button>

          <Button
            variant="destructive"
            className="w-full"
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const response = await fetch("/api/admin/reset-admin");
                const data = await response.json();
                if (response.ok) {
                  setSuccess(
                    data.message ||
                      "Admin user reset successfully. Try logging in now.",
                  );
                } else {
                  setError(data.error || "Failed to reset admin user");
                }
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "An unexpected error occurred",
                );
              } finally {
                setLoading(false);
              }
            }}
          >
            Reset Admin User
          </Button>
        </div>
      </div>
    </div>
  );
}
