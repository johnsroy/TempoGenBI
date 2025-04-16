import { createClient } from "../../../../../supabase/server";
import { createAdminClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const adminClient = await createAdminClient();
    const adminEmail = "admin@genbi.com";
    const adminPassword = "test12345";
    const adminId = "00000000-0000-0000-0000-000000000000";

    // Delete the admin user if it exists (to reset completely)
    try {
      await adminClient.auth.admin.deleteUser(adminId);
    } catch (error) {
      // Ignore errors here, we're just trying to clean up
    }

    // Create admin user in auth schema
    const { data: newAuthUser, error: createError } =
      await adminClient.auth.admin.createUser({
        id: adminId,
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: "Admin User" },
      });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Admin user has been completely reset. Try logging in now.",
    });
  } catch (error) {
    console.error("Error resetting admin:", error);
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
