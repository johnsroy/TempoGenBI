"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../../supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Server, Lock, User, Save, AlertCircle } from "lucide-react";

export default function SMTPConfigPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    host: "",
    port: "587",
    user_name: "",
    password: "",
    sender_email: "",
    sender_name: "GenBI",
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          router.push("/sign-in");
          return;
        }

        setUser(data.user);

        // Check if user is admin by ID
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        // Also check by email as a fallback
        const { data: adminByEmail } = await supabase
          .from("admin_users")
          .select("id")
          .eq("email", data.user.email || "")
          .maybeSingle();

        if (
          !adminData &&
          !adminByEmail &&
          data.user.email !== "admin@genbi.com"
        ) {
          router.push("/dashboard");
          return;
        }

        setIsAdmin(true);

        // Fetch current SMTP config
        const response = await fetch("/api/admin/smtp-config");
        if (response.ok) {
          const { config } = await response.json();
          if (config) {
            setFormData({
              host: config.host || "",
              port: config.port?.toString() || "587",
              user_name: config.user_name || "",
              password: config.password || "",
              sender_email: config.sender_email || "",
              sender_name: config.sender_name || "GenBI",
            });
          }
        }

        setLoading(false);
      } catch (error) {
        router.push("/dashboard");
      }
    }

    checkAdmin();
  }, [supabase, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch("/api/admin/smtp-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          port: parseInt(formData.port),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save SMTP configuration");
      }

      setSuccess("SMTP configuration saved successfully");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Unauthorized Access</h1>
          <p className="text-gray-600">
            You do not have permission to access this page.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50">
      <DashboardNavbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SMTP Configuration
          </h1>

          <div className="relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg mb-8">
            <div className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-md"></div>

            <div className="relative p-6">
              <p className="text-gray-600 mb-4">
                Configure your custom SMTP server for authentication emails.
                This will be used for sign-up confirmations, password resets,
                and other authentication-related communications.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="host">SMTP Host</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Server className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="host"
                        name="host"
                        value={formData.host}
                        onChange={handleChange}
                        placeholder="smtp.example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="port">SMTP Port</Label>
                    <Input
                      id="port"
                      name="port"
                      value={formData.port}
                      onChange={handleChange}
                      placeholder="587"
                      type="number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user_name">SMTP Username</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="user_name"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleChange}
                        placeholder="username"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">SMTP Password</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sender_email">Sender Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="sender_email"
                        name="sender_email"
                        value={formData.sender_email}
                        onChange={handleChange}
                        placeholder="noreply@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sender_name">Sender Name</Label>
                    <Input
                      id="sender_name"
                      name="sender_name"
                      value={formData.sender_name}
                      onChange={handleChange}
                      placeholder="GenBI"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 text-green-500 p-3 rounded-md">
                    {success}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-2 text-blue-700">
              Admin Credentials
            </h2>
            <p className="text-blue-600 mb-2">
              You can use the following admin credentials to access all features
              without payment:
            </p>
            <div className="bg-white p-3 rounded border border-blue-100">
              <p>
                <strong>Email:</strong> admin@genbi.com
              </p>
              <p>
                <strong>Password:</strong> You need to set this via the Supabase
                dashboard
              </p>
            </div>
            <p className="text-sm text-blue-500 mt-2">
              Note: You'll need to set a password for this admin user through
              the Supabase dashboard under Authentication &gt; Users.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
