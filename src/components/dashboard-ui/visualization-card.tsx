"use client";

import {
  BarChart3,
  MoreHorizontal,
  Download,
  Maximize2,
  LineChart,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportChartAsImage, exportDataAsCSV } from "@/lib/visualizations";
import { useState, useRef } from "react";

interface VisualizationCardProps {
  title: string;
  description?: string;
  chartType?: string;
  data?: any[];
  children: React.ReactNode;
  onView?: () => void;
}

export default function VisualizationCard({
  title,
  description,
  chartType = "bar",
  data = [],
  children,
  onView,
}: VisualizationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExportImage = () => {
    if (cardRef.current) {
      exportChartAsImage(cardRef.current, title);
    }
  };

  const handleExportData = () => {
    if (data && data.length > 0) {
      exportDataAsCSV(data, title);
    }
  };

  const getChartIcon = () => {
    switch (chartType.toLowerCase()) {
      case "line":
        return <LineChart className="h-5 w-5 text-green-500" />;
      case "pie":
        return <PieChart className="h-5 w-5 text-purple-500" />;
      case "bar":
      default:
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-md"></div>

      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getChartIcon()}
            <h3 className="font-medium text-gray-800">{title}</h3>
          </div>

          <div
            className={`flex items-center gap-1 ${isHovered ? "opacity-100" : "opacity-0"} transition-opacity`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleExportData}
              title="Export data as CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onView}
              title="View full screen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {description && (
          <p className="text-sm text-gray-500 mb-4">{description}</p>
        )}

        <div className="bg-white/50 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
