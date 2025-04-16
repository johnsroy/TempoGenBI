import { createClient } from "../../../../../supabase/server";
import { createAdminClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

// This is a direct password setter that doesn't rely on the RPC function
// It's a fallback in case the RPC approach doesn't work
export async function POST(request: Request) {
  try {
    // Hard-coded credentials as requested by the user
    const email = "admin@genbi.com";
    const password = "test12345";
    const adminId = "00000000-0000-0000-0000-000000000000";

    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // First, check if the user exists
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!userData) {
      // Create the user if it doesn't exist
      const { error: insertError } = await supabase.from("users").insert({
        id: adminId,
        email: email,
        name: "Admin User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        token_identifier: adminId,
      });

      if (insertError) {
        console.error("Error creating user:", insertError);
      }
    }

    // Check if admin exists in admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!adminData) {
      // Create entry in admin_users table
      const { error: insertError } = await supabase.from("admin_users").insert({
        id: adminId,
        email: email,
        name: "Admin User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error creating admin user:", insertError);
      }
    }

    // Use admin client to update password
    try {
      const { error } = await adminClient.auth.admin.updateUserById(adminId, {
        password,
        email_confirm: true,
      });

      if (error) {
        console.error("Error updating password:", error);
        // Try creating the user if updating failed
        const { error: createError } = await adminClient.auth.admin.createUser({
          id: adminId,
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: { full_name: "Admin User" },
        });

        if (createError) {
          console.error("Error creating admin user:", createError);
          return NextResponse.json(
            { error: createError.message },
            { status: 500 },
          );
        }
      }
    } catch (adminError) {
      console.error("Admin API error:", adminError);
      return NextResponse.json(
        { error: "Failed to set admin password" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Admin password set successfully to test12345",
    });
  } catch (error) {
    console.error("Error in direct-set-password:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
