import { createClient } from "../../../../../supabase/server";
import { createAdminClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const adminEmail = "admin@genbi.com";
    const adminPassword = "test12345";

    // First ensure the admin user exists and has the correct password
    try {
      const { data: adminUser, error } =
        await adminClient.auth.admin.getUserById(
          "00000000-0000-0000-0000-000000000000",
        );

      if (error || !adminUser) {
        // Create the admin user if it doesn't exist
        await adminClient.auth.admin.createUser({
          id: "00000000-0000-0000-0000-000000000000",
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { full_name: "Admin User" },
        });
      } else {
        // Update the password if the user exists
        await adminClient.auth.admin.updateUserById(
          "00000000-0000-0000-0000-000000000000",
          {
            password: adminPassword,
            email_confirm: true,
          },
        );
      }
    } catch (err) {
      console.log("Error setting up admin user:", err);
      // Continue anyway to try the login
    }

    // Sign in the user directly with known credentials
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

    if (signInError) {
      console.error("Error signing in admin:", signInError);
      return NextResponse.json({ error: signInError.message }, { status: 500 });
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Error in force login:", error);
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
