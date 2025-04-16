import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type DatasetRequest = {
  name: string;
  description?: string;
  fileType: string;
  data: any;
  userId: string;
  headers?: string[];
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, description, fileType, data, userId, headers } =
      (await req.json()) as DatasetRequest;

    if (!name || !fileType || !data || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Process the dataset
    // Extract column names from the first row or use provided headers
    const columns = headers
      ? headers.map((header) => ({
          name: header,
          type: typeof data[0]?.[header] || "string",
        }))
      : data.length > 0
        ? Object.keys(data[0]).map((key) => ({
            name: key,
            type: typeof data[0][key],
          }))
        : [];

    // Take a sample of the data (first 5 rows)
    const sampleData = data.slice(0, 5);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

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
        row_count: data.length,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving dataset:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Failed to save dataset" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        message: "Dataset uploaded successfully",
        dataset,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error uploading dataset:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
