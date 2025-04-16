import { createAdminClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const adminClient = await createAdminClient();
    const adminEmail = "admin@genbi.com";
    const adminPassword = "test12345";
    const adminId = "00000000-0000-0000-0000-000000000000";

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

    // Create entries in public tables using direct SQL
    const { error: sqlError } = await adminClient.rpc(
      "create_admin_user_entries",
      {
        admin_id: adminId,
        admin_email: adminEmail,
        admin_name: "Admin User",
      },
    );

    if (sqlError) {
      return NextResponse.json({ error: sqlError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Admin user has been created successfully.",
    });
  } catch (error) {
    console.error("Error creating admin:", error);
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
