"use client";

import { useEffect, useRef } from "react";
import { ChartConfig } from "@/lib/visualizations";

interface BarChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}

export default function BarChart({
  data,
  config,
  className = "",
}: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    renderChart();
  }, [data, config]);

  const renderChart = () => {
    if (!chartRef.current) return;

    const container = chartRef.current;
    container.innerHTML = ""; // Clear previous chart

    const { xAxis = "x", yAxis = "y", colors = ["#4F46E5"] } = config;

    // Find min and max values for scaling
    const maxValue = Math.max(...data.map((item) => Number(item[yAxis]) || 0));

    // Set dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    const padding = { top: 40, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

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
    title.textContent = config.title;
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
    const barWidth = (chartWidth / data.length) * 0.8;
    const barSpacing = (chartWidth / data.length) * 0.2;

    data.forEach((item, index) => {
      const value = Number(item[yAxis]) || 0;
      const barHeight = (value / maxValue) * chartHeight;
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
      bar.setAttribute("rx", "4"); // Rounded corners
      bar.setAttribute("class", "transition-all duration-300 hover:opacity-80");

      // Add tooltip on hover
      bar.addEventListener("mouseover", (e) => {
        const tooltip = document.createElement("div");
        tooltip.textContent = `${item[xAxis]}: ${item[yAxis]}`;
        tooltip.style.position = "absolute";
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY - 30}px`;
        tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        tooltip.style.color = "white";
        tooltip.style.padding = "5px 10px";
        tooltip.style.borderRadius = "4px";
        tooltip.style.fontSize = "12px";
        tooltip.style.zIndex = "1000";
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

      // Add x-axis labels
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      label.textContent = item[xAxis]?.toString() || "";
      label.setAttribute("x", (x + barWidth / 2).toString());
      label.setAttribute("y", (chartHeight + 20).toString());
      label.setAttribute("text-anchor", "middle");
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
      const value = maxValue * (i / tickCount);

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
      label.textContent = value.toLocaleString();
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
  };

  return (
    <div
      ref={chartRef}
      className={`w-full h-full min-h-[300px] ${className}`}
      aria-label={`Bar chart: ${config.title}`}
    />
  );
}
