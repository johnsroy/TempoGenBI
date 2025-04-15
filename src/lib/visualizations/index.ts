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

// Upload a dataset
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
      throw new Error("Failed to upload dataset");
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
