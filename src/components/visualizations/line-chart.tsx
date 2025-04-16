"use client";

import { useEffect, useRef } from "react";
import { ChartConfig } from "@/lib/visualizations";

interface LineChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}

export default function LineChart({
  data,
  config,
  className = "",
}: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    renderChart();
  }, [data, config]);

  const renderChart = () => {
    if (!chartRef.current) return;

    const container = chartRef.current;
    container.innerHTML = ""; // Clear previous chart

    const { xAxis = "x", yAxis = "y", colors = ["#10B981"] } = config;

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

    // Create path for line
    const pathData = data
      .map((item, index) => {
        const value = Number(item[yAxis]) || 0;
        const x = (index / (data.length - 1)) * chartWidth;
        const y = chartHeight - (value / maxValue) * chartHeight;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    // Draw line
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", colors[0]);
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    chartGroup.appendChild(path);

    // Draw area under the line
    const areaPathData = `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
    const areaPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    areaPath.setAttribute("d", areaPathData);
    areaPath.setAttribute("fill", colors[0]);
    areaPath.setAttribute("fill-opacity", "0.1");
    areaPath.setAttribute("stroke", "none");
    chartGroup.insertBefore(areaPath, path); // Insert before the line to keep line on top

    // Draw data points
    data.forEach((item, index) => {
      const value = Number(item[yAxis]) || 0;
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - (value / maxValue) * chartHeight;

      // Create point
      const point = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      point.setAttribute("cx", x.toString());
      point.setAttribute("cy", y.toString());
      point.setAttribute("r", "4");
      point.setAttribute("fill", "white");
      point.setAttribute("stroke", colors[0]);
      point.setAttribute("stroke-width", "2");
      point.setAttribute("class", "transition-all duration-300 hover:r-6");

      // Add tooltip on hover
      point.addEventListener("mouseover", (e) => {
        point.setAttribute("r", "6");

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

      point.addEventListener("mousemove", (e) => {
        const tooltip = document.getElementById("chart-tooltip");
        if (tooltip) {
          tooltip.style.left = `${e.pageX + 10}px`;
          tooltip.style.top = `${e.pageY - 30}px`;
        }
      });

      point.addEventListener("mouseout", () => {
        point.setAttribute("r", "4");

        const tooltip = document.getElementById("chart-tooltip");
        if (tooltip) {
          document.body.removeChild(tooltip);
        }
      });

      chartGroup.appendChild(point);

      // Add x-axis labels
      if (
        index === 0 ||
        index === data.length - 1 ||
        index % Math.ceil(data.length / 6) === 0
      ) {
        const label = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        label.textContent = item[xAxis]?.toString() || "";
        label.setAttribute("x", x.toString());
        label.setAttribute("y", (chartHeight + 20).toString());
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("class", "text-xs text-gray-500");
        chartGroup.appendChild(label);
      }
    });

    // Add y-axis
    const yAxisElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    yAxisElement.setAttribute("x1", "0");
    yAxisElement.setAttribute("y1", "0");
    yAxisElement.setAttribute("x2", "0");
    yAxisElement.setAttribute("y2", chartHeight.toString());
    yAxisElement.setAttribute("stroke", "#e5e7eb");
    chartGroup.appendChild(yAxisElement);

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
    const xAxisElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    xAxisElement.setAttribute("x1", "0");
    xAxisElement.setAttribute("y1", chartHeight.toString());
    xAxisElement.setAttribute("x2", chartWidth.toString());
    xAxisElement.setAttribute("y2", chartHeight.toString());
    xAxisElement.setAttribute("stroke", "#e5e7eb");
    chartGroup.appendChild(xAxisElement);
  };

  return (
    <div
      ref={chartRef}
      className={`w-full h-full min-h-[300px] ${className}`}
      aria-label={`Line chart: ${config.title}`}
    />
  );
}
