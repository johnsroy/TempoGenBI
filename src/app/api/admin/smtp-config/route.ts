import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminCheck, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", userData.user.id)
      .single();

    if (adminError || !adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get SMTP configuration
    const { data, error } = await supabase
      .from("smtp_config")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ config: data?.[0] || null });
  } catch (error) {
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminCheck, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", userData.user.id)
      .single();

    if (adminError || !adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { host, port, user_name, password, sender_email, sender_name } =
      await request.json();

    // Validate required fields
    if (!host || !port || !user_name || !password || !sender_email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Deactivate all existing configurations
    await supabase
      .from("smtp_config")
      .update({ is_active: false })
      .eq("is_active", true);

    // Insert new configuration
    const { data, error } = await supabase
      .from("smtp_config")
      .insert({
        host,
        port,
        user_name,
        password,
        sender_email,
        sender_name,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "SMTP configuration saved successfully",
      config: data,
    });
  } catch (error) {
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
