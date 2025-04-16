import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      name,
      description,
      fileType,
      userId,
      sessionId,
      totalChunks,
      headers,
    } = await request.json();

    if (!name || !fileType || !userId || !sessionId || !totalChunks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get all chunks for this session
    const { data: chunks, error: fetchError } = await supabase
      .from("dataset_chunks")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .order("chunk_index", { ascending: true });

    if (fetchError) {
      console.error("Error fetching chunks:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Verify we have all chunks
    if (!chunks || chunks.length !== totalChunks) {
      return NextResponse.json(
        {
          error: `Missing chunks. Expected ${totalChunks}, got ${chunks?.length || 0}`,
        },
        { status: 400 },
      );
    }

    // Combine all data
    let allData: any[] = [];
    chunks.forEach((chunk) => {
      allData = allData.concat(chunk.data);
    });

    // Extract column information
    const columns = headers.map((header: string) => ({
      name: header,
      type: typeof allData[0]?.[header] || "string",
    }));

    // Take a sample of the data (first 5 rows)
    const sampleData = allData.slice(0, 5);

    // Save the dataset metadata to the datasets table
    const { data: dataset, error } = await supabase
      .from("datasets")
      .insert({
        user_id: userId,
        name,
        description,
        file_type: fileType,
        columns,
        sample_data: sampleData,
        row_count: allData.length,
        session_id: sessionId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving dataset:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clean up chunks (optional - you might want to keep them for a while)
    // This can be done asynchronously or via a scheduled job
    const { error: cleanupError } = await supabase
      .from("dataset_chunks")
      .delete()
      .eq("session_id", sessionId);

    if (cleanupError) {
      console.error("Error cleaning up chunks:", cleanupError);
      // Continue anyway since the dataset was created successfully
    }

    return NextResponse.json({
      message: "Dataset uploaded successfully",
      dataset,
    });
  } catch (error) {
    console.error("Error in finalize-upload route:", error);
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
