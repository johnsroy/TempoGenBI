"use client";

import { useEffect, useRef } from "react";
import { ChartConfig } from "@/lib/visualizations";

interface HistogramProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}

export default function Histogram({
  data,
  config,
  className = "",
}: HistogramProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    renderChart();
  }, [data, config]);

  const renderChart = () => {
    if (!chartRef.current) return;

    const container = chartRef.current;
    container.innerHTML = ""; // Clear previous chart

    const { valueField = "value", colors = ["#4F46E5"], bins = 10 } = config;

    // Extract values from data
    const values = data.map((item) => Number(item[valueField]) || 0);

    // Find min and max values
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Calculate bin width
    const binWidth = (maxValue - minValue) / bins;

    // Create histogram bins
    const histogramData: {
      bin: string;
      count: number;
      start: number;
      end: number;
    }[] = [];

    for (let i = 0; i < bins; i++) {
      const start = minValue + i * binWidth;
      const end = minValue + (i + 1) * binWidth;

      // Count values in this bin
      const count = values.filter(
        (value) =>
          value >= start && (i === bins - 1 ? value <= end : value < end),
      ).length;

      histogramData.push({
        bin: `${start.toFixed(1)}-${end.toFixed(1)}`,
        count,
        start,
        end,
      });
    }

    // Set dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    const padding = { top: 40, right: 20, bottom: 60, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find max count for scaling
    const maxCount = Math.max(...histogramData.map((bin) => bin.count));

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width.toString());
    svg.setAttribute("height", height.toString());
    svg.setAttribute("class", "overflow-visible");
    container.appendChild(svg);

    // Add title
    const title = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    title.textContent = config.title || `Distribution of ${valueField}`;
    title.setAttribute("x", (width / 2).toString());
    title.setAttribute("y", "20");
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("class", "text-sm font-medium");
    svg.appendChild(title);

    // Create chart group
    const chartGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    chartGroup.setAttribute(
      "transform",
      `translate(${padding.left}, ${padding.top})`,
    );
    svg.appendChild(chartGroup);

    // Draw bars
    const barWidth = (chartWidth / histogramData.length) * 0.9;
    const barSpacing = (chartWidth / histogramData.length) * 0.1;

    histogramData.forEach((bin, index) => {
      const barHeight = (bin.count / maxCount) * chartHeight;
      const x = index * (barWidth + barSpacing) + barSpacing / 2;
      const y = chartHeight - barHeight;

      // Create bar
      const bar = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      bar.setAttribute("x", x.toString());
      bar.setAttribute("y", y.toString());
      bar.setAttribute("width", barWidth.toString());
      bar.setAttribute("height", barHeight.toString());
      bar.setAttribute("fill", colors[0]);
      bar.setAttribute("rx", "2"); // Rounded corners
      bar.setAttribute("class", "transition-all duration-300 hover:opacity-80");

      // Add tooltip on hover
      bar.addEventListener("mouseover", (e) => {
        const tooltip = document.createElement("div");
        tooltip.textContent = `Range: ${bin.start.toFixed(1)} to ${bin.end.toFixed(1)}\nCount: ${bin.count}`;
        tooltip.style.position = "absolute";
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY - 30}px`;
        tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        tooltip.style.color = "white";
        tooltip.style.padding = "5px 10px";
        tooltip.style.borderRadius = "4px";
        tooltip.style.fontSize = "12px";
        tooltip.style.zIndex = "1000";
        tooltip.style.whiteSpace = "pre";
        tooltip.id = "chart-tooltip";
        document.body.appendChild(tooltip);
      });

      bar.addEventListener("mousemove", (e) => {
        const tooltip = document.getElementById("chart-tooltip");
        if (tooltip) {
          tooltip.style.left = `${e.pageX + 10}px`;
          tooltip.style.top = `${e.pageY - 30}px`;
        }
      });

      bar.addEventListener("mouseout", () => {
        const tooltip = document.getElementById("chart-tooltip");
        if (tooltip) {
          document.body.removeChild(tooltip);
        }
      });

      chartGroup.appendChild(bar);

      // Add count label on top of bar if there's enough space
      if (barHeight > 20) {
        const countLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        countLabel.textContent = bin.count.toString();
        countLabel.setAttribute("x", (x + barWidth / 2).toString());
        countLabel.setAttribute("y", (y + 15).toString());
        countLabel.setAttribute("text-anchor", "middle");
        countLabel.setAttribute("class", "text-xs text-white font-medium");
        chartGroup.appendChild(countLabel);
      }

      // Add x-axis labels (rotated for better fit)
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      label.textContent = bin.bin;
      label.setAttribute("x", (x + barWidth / 2).toString());
      label.setAttribute("y", (chartHeight + 15).toString());
      label.setAttribute("text-anchor", "end");
      label.setAttribute(
        "transform",
        `rotate(-45, ${x + barWidth / 2}, ${chartHeight + 15})`,
      );
      label.setAttribute("class", "text-xs text-gray-500");
      chartGroup.appendChild(label);
    });

    // Add y-axis
    const yAxis = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    yAxis.setAttribute("x1", "0");
    yAxis.setAttribute("y1", "0");
    yAxis.setAttribute("x2", "0");
    yAxis.setAttribute("y2", chartHeight.toString());
    yAxis.setAttribute("stroke", "#e5e7eb");
    chartGroup.appendChild(yAxis);

    // Add y-axis ticks and labels
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const y = chartHeight * (1 - i / tickCount);
      const value = maxCount * (i / tickCount);

      // Tick line
      const tick = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      tick.setAttribute("x1", "0");
      tick.setAttribute("y1", y.toString());
      tick.setAttribute("x2", "-5");
      tick.setAttribute("y2", y.toString());
      tick.setAttribute("stroke", "#e5e7eb");
      chartGroup.appendChild(tick);

      // Grid line
      const grid = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      grid.setAttribute("x1", "0");
      grid.setAttribute("y1", y.toString());
      grid.setAttribute("x2", chartWidth.toString());
      grid.setAttribute("y2", y.toString());
      grid.setAttribute("stroke", "#f3f4f6");
      grid.setAttribute("stroke-dasharray", "4");
      chartGroup.appendChild(grid);

      // Label
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      label.textContent = Math.round(value).toString();
      label.setAttribute("x", "-10");
      label.setAttribute("y", (y + 4).toString());
      label.setAttribute("text-anchor", "end");
      label.setAttribute("class", "text-xs text-gray-500");
      chartGroup.appendChild(label);
    }

    // Add x-axis
    const xAxisLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    xAxisLine.setAttribute("x1", "0");
    xAxisLine.setAttribute("y1", chartHeight.toString());
    xAxisLine.setAttribute("x2", chartWidth.toString());
    xAxisLine.setAttribute("y2", chartHeight.toString());
    xAxisLine.setAttribute("stroke", "#e5e7eb");
    chartGroup.appendChild(xAxisLine);

    // Add x-axis label
    const xAxisLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    xAxisLabel.textContent = valueField;
    xAxisLabel.setAttribute("x", (chartWidth / 2).toString());
    xAxisLabel.setAttribute("y", (chartHeight + 45).toString());
    xAxisLabel.setAttribute("text-anchor", "middle");
    xAxisLabel.setAttribute("class", "text-sm text-gray-700");
    chartGroup.appendChild(xAxisLabel);

    // Add y-axis label
    const yAxisLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    yAxisLabel.textContent = "Frequency";
    yAxisLabel.setAttribute(
      "transform",
      `rotate(-90, -35, ${chartHeight / 2})`,
    );
    yAxisLabel.setAttribute("x", "-35");
    yAxisLabel.setAttribute("y", (chartHeight / 2).toString());
    yAxisLabel.setAttribute("text-anchor", "middle");
    yAxisLabel.setAttribute("class", "text-sm text-gray-700");
    chartGroup.appendChild(yAxisLabel);
  };

  return (
    <div
      ref={chartRef}
      className={`w-full h-full min-h-[300px] ${className}`}
      aria-label={`Histogram: ${config.title || "Distribution"}`}
    />
  );
}
