import { createClient } from "../../../../../supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { chartData, name, description, userId, datasetId } =
      await request.json();

    if (!chartData || !name || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Save the visualization to the database
    const { data, error } = await supabase
      .from("visualizations")
      .insert({
        user_id: userId,
        dataset_id: datasetId,
        name,
        description,
        chart_type: chartData.chartConfig.type,
        chart_config: chartData.chartConfig,
        data: chartData.data,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving visualization:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Visualization saved successfully",
      visualization: data,
    });
  } catch (error) {
    console.error("Error in save-visualization route:", error);
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
