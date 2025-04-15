import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type QueryRequest = {
  query: string;
  datasetId?: string;
  userId: string;
};

type ChartConfig = {
  type: string;
  title: string;
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  colors?: string[];
};

type ProcessedQuery = {
  chartConfig: ChartConfig;
  data: any[];
  summary: string;
};

// Mock function to process natural language query
function processNaturalLanguageQuery(
  query: string,
  datasetId?: string,
): ProcessedQuery {
  // This is a simplified mock implementation
  // In a real implementation, this would use NLP and data analysis

  const lowercaseQuery = query.toLowerCase();

  // Sample data for demonstration
  const sampleData = [
    { month: "Jan", revenue: 1200, users: 450 },
    { month: "Feb", revenue: 1800, users: 550 },
    { month: "Mar", revenue: 1400, users: 600 },
    { month: "Apr", revenue: 2200, users: 700 },
    { month: "May", revenue: 2600, users: 850 },
    { month: "Jun", revenue: 3100, users: 950 },
  ];

  let chartConfig: ChartConfig = {
    type: "bar",
    title: "Data Visualization",
  };

  let summary = "Here's a visualization based on your query.";

  // Simple keyword matching to determine chart type and configuration
  if (lowercaseQuery.includes("revenue") || lowercaseQuery.includes("sales")) {
    if (
      lowercaseQuery.includes("month") ||
      lowercaseQuery.includes("monthly")
    ) {
      chartConfig = {
        type: "bar",
        title: "Monthly Revenue",
        xAxis: "month",
        yAxis: "revenue",
        colors: ["#4F46E5"],
      };
      summary = "This bar chart shows your monthly revenue performance.";
    }
  } else if (
    lowercaseQuery.includes("user") ||
    lowercaseQuery.includes("growth")
  ) {
    chartConfig = {
      type: "line",
      title: "User Growth",
      xAxis: "month",
      yAxis: "users",
      colors: ["#10B981"],
    };
    summary = "This line chart shows your user growth over time.";
  } else if (
    lowercaseQuery.includes("compare") ||
    lowercaseQuery.includes("comparison")
  ) {
    chartConfig = {
      type: "bar",
      title: "Revenue vs Users",
      xAxis: "month",
      series: ["revenue", "users"],
      colors: ["#4F46E5", "#10B981"],
    };
    summary = "This chart compares revenue and user growth over time.";
  } else if (
    lowercaseQuery.includes("pie") ||
    lowercaseQuery.includes("distribution")
  ) {
    // Create a pie chart with aggregated data
    chartConfig = {
      type: "pie",
      title: "Revenue Distribution",
      series: ["revenue"],
      colors: [
        "#4F46E5",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#EC4899",
      ],
    };
    summary = "This pie chart shows the distribution of revenue across months.";
  }

  return {
    chartConfig,
    data: sampleData,
    summary,
  };
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, datasetId, userId } = (await req.json()) as QueryRequest;

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process the natural language query
    const result = processNaturalLanguageQuery(query, datasetId);

    // In a real implementation, you would save the query and result to the database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Save the query to the saved_queries table
    const { error: queryError } = await supabase.from("saved_queries").insert({
      user_id: userId,
      query: query,
    });

    if (queryError) {
      console.error("Error saving query:", queryError);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing query:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
