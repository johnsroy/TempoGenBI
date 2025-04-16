// Visualization library for GenBI

export type ChartConfig = {
  type: string;
  title: string;
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  colors?: string[];
  height?: number;
  width?: number;
};

export type ChartData = {
  chartConfig: ChartConfig;
  data: any[];
  summary?: string;
};

// Helper function to get chart colors
export function getChartColors(count: number = 1): string[] {
  const colorPalette = [
    "#4F46E5", // Indigo
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#6366F1", // Indigo
    "#14B8A6", // Teal
  ];

  if (count <= colorPalette.length) {
    return colorPalette.slice(0, count);
  }

  // If we need more colors than in our palette, we'll repeat them
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(colorPalette[i % colorPalette.length]);
  }

  return colors;
}

// Process a natural language query
export async function processQuery(
  query: string,
  userId: string,
  datasetId?: string,
): Promise<ChartData> {
  try {
    const response = await fetch("/api/visualizations/process-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        datasetId,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to process query");
    }

    return await response.json();
  } catch (error) {
    console.error("Error processing query:", error);
    throw error;
  }
}

// Upload a dataset with chunking support for large files
export async function uploadChunkedDataset(
  name: string,
  description: string,
  file: File,
  userId: string,
  onProgress?: (progress: number) => void,
  preProcessedData?: any[],
  headers?: string[],
): Promise<any> {
  try {
    // If we have pre-processed data, use it directly
    if (preProcessedData && headers) {
      const response = await fetch("/api/visualizations/upload-dataset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          fileType: file.type,
          data: preProcessedData,
          userId,
          headers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload dataset");
      }

      if (onProgress) onProgress(100);
      return await response.json();
    }

    // For large files, use chunked upload
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedChunks = 0;
    let sessionId =
      Date.now().toString() + "-" + Math.random().toString(36).substring(2, 15);
    let parsedData: any[] = [];
    let columnHeaders: string[] = [];

    // Function to read a chunk of the file
    const readChunk = (start: number, end: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error("Failed to read file chunk"));
          }
        };
        reader.onerror = () => reject(new Error("Error reading file chunk"));

        // Read the specified chunk of the file
        const blob = file.slice(start, end);
        reader.readAsText(blob);
      });
    };

    // Process the first chunk to get headers
    const firstChunk = await readChunk(0, Math.min(CHUNK_SIZE, file.size));
    const lines = firstChunk.split("\n");

    if (lines.length === 0 || !lines[0].includes(",")) {
      throw new Error(
        "Invalid CSV format. The file must contain comma-separated values with a header row.",
      );
    }

    columnHeaders = lines[0].split(",").map((header) => header.trim());

    // Validate that we have at least one header
    if (
      columnHeaders.length === 0 ||
      (columnHeaders.length === 1 && !columnHeaders[0])
    ) {
      throw new Error("Invalid CSV format. Could not detect column headers.");
    }

    // Process each chunk
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);

      // Read the chunk
      const chunkText = await readChunk(start, end);

      // Parse the chunk (handle partial lines at the end)
      let chunkLines = chunkText.split("\n");

      // If this is not the first chunk, the first line might be incomplete
      // We'll skip the header row for all chunks except the first
      const startLine = chunkIndex === 0 ? 1 : 0;

      // Process each line in the chunk
      for (let i = startLine; i < chunkLines.length; i++) {
        if (!chunkLines[i].trim()) continue;

        const values = chunkLines[i].split(",");
        const row: Record<string, string | number> = {};

        columnHeaders.forEach((header, index) => {
          const value = values[index]?.trim() || "";
          // Try to convert to number if possible
          row[header] = isNaN(Number(value)) ? value : Number(value);
        });

        parsedData.push(row);

        // If we've accumulated enough rows, send a batch
        if (parsedData.length >= 1000) {
          await uploadBatch(parsedData, chunkIndex, sessionId);
          parsedData = [];
        }
      }

      // Upload any remaining data in this chunk
      if (parsedData.length > 0) {
        await uploadBatch(parsedData, chunkIndex, sessionId);
        parsedData = [];
      }

      uploadedChunks++;
      if (onProgress) {
        onProgress((uploadedChunks / totalChunks) * 100);
      }
    }

    // Finalize the upload
    const finalizeResponse = await fetch(
      "/api/visualizations/finalize-upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          fileType: file.type,
          userId,
          sessionId,
          totalChunks,
          headers: columnHeaders,
        }),
      },
    );

    if (!finalizeResponse.ok) {
      const errorData = await finalizeResponse.json();
      throw new Error(errorData.error || "Failed to finalize dataset upload");
    }

    return await finalizeResponse.json();
  } catch (error) {
    console.error("Error uploading dataset:", error);
    throw error;
  }

  // Helper function to upload a batch of data
  async function uploadBatch(
    data: any[],
    chunkIndex: number,
    sessionId: string,
  ) {
    const response = await fetch("/api/visualizations/upload-chunk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
        chunkIndex,
        sessionId,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to upload chunk ${chunkIndex}`,
      );
    }

    return await response.json();
  }
}

// Legacy function for backward compatibility
export async function uploadDataset(
  name: string,
  description: string,
  fileType: string,
  data: any,
  userId: string,
): Promise<any> {
  try {
    const response = await fetch("/api/visualizations/upload-dataset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        fileType,
        data,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload dataset");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading dataset:", error);
    throw error;
  }
}

// Save a visualization
export async function saveVisualization(
  chartData: ChartData,
  name: string,
  description: string,
  userId: string,
  datasetId?: string,
): Promise<any> {
  try {
    const response = await fetch("/api/visualizations/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chartData,
        name,
        description,
        userId,
        datasetId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save visualization");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving visualization:", error);
    throw error;
  }
}

// Export chart as image
export function exportChartAsImage(
  chartElement: HTMLElement,
  fileName: string = "chart",
): void {
  // This is a simplified implementation
  // In a real implementation, you would use a library like html2canvas
  alert(
    "Export functionality will be implemented with a proper charting library",
  );
}

// Export data as CSV
export function exportDataAsCSV(data: any[], fileName: string = "data"): void {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Get the headers
  const headers = Object.keys(data[0]);

  // Create CSV content
  let csvContent = headers.join(",") + "\n";

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle values with commas by wrapping in quotes
      return typeof value === "string" && value.includes(",")
        ? `"${value}"`
        : value;
    });
    csvContent += values.join(",") + "\n";
  });

  // Create a blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
