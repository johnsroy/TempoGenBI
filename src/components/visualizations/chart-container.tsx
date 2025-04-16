"use client";

import { useState } from "react";
import {
  ChartData,
  exportChartAsImage,
  exportDataAsCSV,
} from "@/lib/visualizations";
import BarChart from "./bar-chart";
import LineChart from "./line-chart";
import PieChart from "./pie-chart";
import ScatterPlot from "./scatter-plot";
import BubbleChart from "./bubble-chart";
import DataTable from "./data-table";
import Table from "./table";
import Histogram from "./histogram";
import PivotTable from "./pivot-table";
import { Button } from "@/components/ui/button";
import {
  Download,
  Share2,
  Save,
  Table as TableIcon,
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterChart,
  BarChartHorizontal,
  Grid3X3,
} from "lucide-react";

interface ChartContainerProps {
  chartData: ChartData;
  onSave?: () => void;
  className?: string;
}

export default function ChartContainer({
  chartData,
  onSave,
  className = "",
}: ChartContainerProps) {
  const [chartElement, setChartElement] = useState<HTMLElement | null>(null);
  const [chartType, setChartType] = useState<string>(
    chartData.chartConfig.type.toLowerCase(),
  );

  const renderChart = () => {
    const { chartConfig, data } = chartData;
    // Use the selected chart type, but fall back to the config type if needed
    const type = chartType || chartConfig.type.toLowerCase();

    switch (type) {
      case "bar":
        return <BarChart data={data} config={{ ...chartConfig, type }} />;
      case "line":
        return <LineChart data={data} config={{ ...chartConfig, type }} />;
      case "pie":
        return <PieChart data={data} config={{ ...chartConfig, type }} />;
      case "scatter":
        return <ScatterPlot data={data} config={{ ...chartConfig, type }} />;
      case "bubble":
        return <BubbleChart data={data} config={{ ...chartConfig, type }} />;
      case "table":
        return <Table data={data} config={{ ...chartConfig, type }} />;
      case "datatable":
        return <DataTable data={data} config={{ ...chartConfig, type }} />;
      case "histogram":
        return <Histogram data={data} config={{ ...chartConfig, type }} />;
      case "pivot":
        return <PivotTable data={data} config={{ ...chartConfig, type }} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Unsupported chart type: {type}</p>
          </div>
        );
    }
  };

  const handleExportImage = () => {
    if (chartElement) {
      exportChartAsImage(chartElement, chartData.chartConfig.title);
    }
  };

  const handleExportCSV = () => {
    exportDataAsCSV(chartData.data, chartData.chartConfig.title);
  };

  // Determine which chart types are available for this data
  const getAvailableChartTypes = () => {
    const { data } = chartData;
    if (!data || data.length === 0) return [];

    // Check data structure to determine compatible chart types
    const firstItem = data[0];
    const keys = Object.keys(firstItem);
    const hasNumericValues = keys.some(
      (key) => typeof firstItem[key] === "number",
    );

    // All data can be displayed as a table
    const types = ["table", "datatable"];

    if (hasNumericValues) {
      // If we have numeric values, we can do bar, line, and histogram charts
      types.push("bar", "line", "histogram");

      // If we have at least two numeric fields, we can do scatter plots
      const numericFields = keys.filter(
        (key) => typeof firstItem[key] === "number",
      );
      if (numericFields.length >= 2) {
        types.push("scatter");
      }

      // If we have at least three numeric fields, we can do bubble charts
      if (numericFields.length >= 3) {
        types.push("bubble");
      }

      // Pie charts work well with categorical data and a numeric value
      const categoricalFields = keys.filter(
        (key) => typeof firstItem[key] === "string",
      );
      if (categoricalFields.length > 0 && numericFields.length > 0) {
        types.push("pie");
      }

      // Pivot tables work well with at least two categorical fields and a numeric value
      if (categoricalFields.length >= 2 && numericFields.length > 0) {
        types.push("pivot");
      }
    }

    return types;
  };

  const availableChartTypes = getAvailableChartTypes();

  const getChartTypeIcon = (type: string) => {
    switch (type) {
      case "bar":
        return <BarChart2 className="h-4 w-4" />;
      case "line":
        return <LineChartIcon className="h-4 w-4" />;
      case "pie":
        return <PieChartIcon className="h-4 w-4" />;
      case "table":
      case "datatable":
        return <TableIcon className="h-4 w-4" />;
      case "scatter":
        return <ScatterChart className="h-4 w-4" />;
      case "bubble":
        return <ScatterChart className="h-4 w-4" />;
      case "histogram":
        return <BarChartHorizontal className="h-4 w-4" />;
      case "pivot":
        return <Grid3X3 className="h-4 w-4" />;
      default:
        return <BarChart2 className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={`relative bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-md p-4 ${className}`}
    >
      {chartData.summary && (
        <p className="text-sm text-gray-600 mb-4">{chartData.summary}</p>
      )}

      <div className="flex justify-between items-center mb-4">
        {/* Chart type selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {availableChartTypes.map((type) => (
            <Button
              key={type}
              variant={chartType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType(type)}
              className="flex items-center gap-1 text-xs"
            >
              {getChartTypeIcon(type)}
              <span className="capitalize">{type}</span>
            </Button>
          ))}
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportCSV}
            title="Export as CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportImage}
            title="Export as Image"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          {onSave && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSave}
              title="Save Visualization"
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div ref={(el) => setChartElement(el)} className="mt-2">
        {renderChart()}
      </div>
    </div>
  );
}
