"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, Key } from "lucide-react";

export default function AdminPasswordPage() {
  const [password, setPassword] = useState("test12345");
  const [confirmPassword, setConfirmPassword] = useState("test12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Try the regular endpoint first
      const response = await fetch("/api/admin/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the regular endpoint fails, try the direct endpoint
        const directResponse = await fetch("/api/admin/direct-set-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const directData = await directResponse.json();

        if (!directResponse.ok) {
          throw new Error(directData.error || "Failed to set admin password");
        }

        setSuccess(
          "Admin password set successfully to test12345! You can now log in with admin@genbi.com and this password.",
        );
      } else {
        setSuccess(
          "Admin password set successfully! You can now log in with admin@genbi.com and your new password.",
        );
      }

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSet = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/direct-set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set admin password");
      }

      setSuccess(
        "Admin password set successfully to test12345! You can now log in with admin@genbi.com and this password.",
      );
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
          Set Admin Password
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

        <p className="text-gray-600 mb-6">
          Use this form to set a password for the admin user (admin@genbi.com).
          Once set, you can log in with these credentials to access all admin
          features.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-start">
              <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Setting Password...
              </>
            ) : (
              "Set Admin Password"
            )}
          </Button>

          <Button
            type="button"
            onClick={handleDirectSet}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Setting Password...
              </>
            ) : (
              "Set Default Password (test12345)"
            )}
          </Button>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            <strong>Note:</strong> This page is only accessible during
            development. In a production environment, you would set the admin
            password through the Supabase dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
