import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Use a direct SQL query to update the admin user's password
    // This bypasses the admin API restrictions
    const { error } = await supabase.rpc("admin_set_password", {
      admin_email: "admin@genbi.com",
      new_password: password,
    });

    if (error) {
      console.error("Error setting admin password:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Admin password set successfully",
    });
  } catch (error) {
    console.error("Unexpected error setting admin password:", error);
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
