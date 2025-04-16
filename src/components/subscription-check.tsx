"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase/client";

interface SubscriptionCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function SubscriptionCheck({
  children,
  redirectTo = "/pricing",
}: SubscriptionCheckProps) {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkSubscription() {
      try {
        // Get the current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push("/sign-in");
          return;
        }

        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("id, email")
          .eq("id", userData.user.id)
          .maybeSingle();

        // Also check by email as a fallback
        const { data: adminByEmail, error: adminEmailError } = await supabase
          .from("admin_users")
          .select("id, email")
          .eq("email", userData.user.email || "")
          .maybeSingle();

        // If user is admin, they have access to all features
        if (
          adminData ||
          adminByEmail ||
          userData.user.email === "admin@genbi.com"
        ) {
          console.log("Admin access granted");
          setIsSubscribed(true);
          setLoading(false);
          return;
        }

        // Otherwise check for an active subscription
        const { data: subscription, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("status", "active")
          .single();

        if (error || !subscription) {
          router.push(redirectTo);
          return;
        }

        setIsSubscribed(true);
        setLoading(false);
      } catch (error) {
        console.error("Subscription check error:", error);
        // For development purposes, allow access even if there's an error
        setIsSubscribed(true);
        setLoading(false);
      }
    }

    checkSubscription();
  }, [supabase, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
