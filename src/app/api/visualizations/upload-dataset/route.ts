import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, description, fileType, data, userId } = await request.json();

    if (!name || !fileType || !data || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Call the Supabase Edge Function to upload the dataset
    const { data: result, error } = await supabase.functions.invoke(
      "supabase-functions-upload-dataset",
      {
        body: { name, description, fileType, data, userId },
      },
    );

    if (error) {
      console.error("Error uploading dataset:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in upload-dataset route:", error);
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
