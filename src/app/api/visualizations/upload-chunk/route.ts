import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { data, chunkIndex, sessionId, userId } = await request.json();

    if (!data || !sessionId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Store the chunk in a temporary table
    const { error } = await supabase.from("dataset_chunks").insert({
      session_id: sessionId,
      chunk_index: chunkIndex,
      user_id: userId,
      data: data,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error storing chunk:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Chunk ${chunkIndex} uploaded successfully`,
    });
  } catch (error) {
    console.error("Error in upload-chunk route:", error);
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
