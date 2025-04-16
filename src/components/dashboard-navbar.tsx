"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { UserCircle, Home, Settings, Mail, BarChart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;

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
          adminData ||
          adminByEmail ||
          data.user.email === "admin@genbi.com"
        ) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [supabase]);

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch className="text-xl font-bold">
            GenBI
          </Link>
          <div className="hidden md:flex space-x-4 ml-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span className="flex items-center">
                <BarChart className="h-4 w-4 mr-1" /> Dashboard
              </span>
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/admin/smtp"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" /> SMTP Config
                </span>
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAdmin && (
                <>
                  <DropdownMenuItem className="text-blue-600 font-medium">
                    Admin Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/admin/smtp")}
                  >
                    <Mail className="h-4 w-4 mr-2" /> SMTP Configuration
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
