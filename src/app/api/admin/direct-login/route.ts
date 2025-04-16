import { createClient } from "../../../../../supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../../supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // First, ensure the admin user exists in auth.users
    const adminEmail = "admin@genbi.com";
    const adminPassword = "test12345";

    // Check if admin exists by email
    const { data: existingAuthUser, error: authCheckError } =
      await adminClient.auth.admin.listUsers();

    let adminUser = existingAuthUser?.users?.find(
      (user) => user.email === adminEmail,
    );
    let adminId = adminUser?.id || "00000000-0000-0000-0000-000000000000";

    if (!adminUser) {
      // Create admin user in auth schema
      const { data: newAuthUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { full_name: "Admin User" },
        });

      if (createError) {
        console.error("Error creating admin auth user:", createError);
        return NextResponse.json(
          { error: createError.message },
          { status: 500 },
        );
      }

      adminId = newAuthUser.user.id;
    } else {
      // Update existing admin user's password
      const { error: updateError } =
        await adminClient.auth.admin.updateUserById(adminId, {
          password: adminPassword,
          email_confirm: true,
        });

      if (updateError) {
        console.error("Error updating admin password:", updateError);
      }
    }

    // Check if admin exists in admin_users table
    const { data: existingAdminUser, error: adminUserError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", adminEmail)
      .maybeSingle();

    if (!existingAdminUser) {
      // Create entry in admin_users table
      const { error: insertError } = await supabase.from("admin_users").insert({
        id: adminId,
        email: adminEmail,
        name: "Admin User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error creating admin user:", insertError);
      }
    }

    // Also ensure user exists in regular users table for compatibility
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", adminEmail)
      .maybeSingle();

    if (!existingUser) {
      // Create entry in users table
      const { error: insertUserError } = await supabase.from("users").insert({
        id: adminId,
        email: adminEmail,
        name: "Admin User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertUserError) {
        console.error("Error creating regular user entry:", insertUserError);
      }
    }

    // Sign in the user directly
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
    console.error("Error in direct login:", error);
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
