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
import { Button } from "@/components/ui/button";
import { Download, Share2, Save } from "lucide-react";

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

  const renderChart = () => {
    const { chartConfig, data } = chartData;

    switch (chartConfig.type.toLowerCase()) {
      case "bar":
        return <BarChart data={data} config={chartConfig} />;
      case "line":
        return <LineChart data={data} config={chartConfig} />;
      case "pie":
        return <PieChart data={data} config={chartConfig} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              Unsupported chart type: {chartConfig.type}
            </p>
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

  return (
    <div
      className={`relative bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-md p-4 ${className}`}
    >
      {chartData.summary && (
        <p className="text-sm text-gray-600 mb-4">{chartData.summary}</p>
      )}

      <div className="absolute top-4 right-4 flex items-center gap-2">
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

      <div ref={(el) => setChartElement(el)} className="mt-2">
        {renderChart()}
      </div>
    </div>
  );
}
