"use client";

import { useEffect, useRef } from "react";
import { ChartConfig } from "@/lib/visualizations";

interface BubbleChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}

export default function BubbleChart({
  data,
  config,
  className = "",
}: BubbleChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    renderChart();
  }, [data, config]);

  const renderChart = () => {
    if (!chartRef.current) return;

    const container = chartRef.current;
    container.innerHTML = ""; // Clear previous chart

    const {
      xAxis = "x",
      yAxis = "y",
      sizeAxis = "size",
      colors = ["#4F46E5"],
      series = [],
    } = config;

    // Find min and max values for scaling
    const xValues = data.map((item) => Number(item[xAxis]) || 0);
    const yValues = data.map((item) => Number(item[yAxis]) || 0);
    const sizeValues = data.map((item) => Number(item[sizeAxis]) || 1);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const sizeMin = Math.min(...sizeValues);
    const sizeMax = Math.max(...sizeValues);

    // Add padding to min/max values
    const xPadding = (xMax - xMin) * 0.1;
    const yPadding = (yMax - yMin) * 0.1;

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

    // Draw bubbles
    data.forEach((item, index) => {
      const x =
        (((Number(item[xAxis]) || 0) - xMin) / (xMax - xMin || 1)) * chartWidth;
      const y =
        chartHeight -
        (((Number(item[yAxis]) || 0) - yMin) / (yMax - yMin || 1)) *
          chartHeight;

      // Calculate bubble size (min 5, max 30)
      const minRadius = 5;
      const maxRadius = 30;
      const sizeValue = Number(item[sizeAxis]) || sizeMin;
      const normalizedSize = (sizeValue - sizeMin) / (sizeMax - sizeMin || 1);
      const radius = minRadius + normalizedSize * (maxRadius - minRadius);

      // Create bubble
      const bubble = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      bubble.setAttribute("cx", x.toString());
      bubble.setAttribute("cy", y.toString());
      bubble.setAttribute("r", radius.toString());
      bubble.setAttribute("fill", colors[0]);
      bubble.setAttribute("opacity", "0.7");
      bubble.setAttribute(
        "class",
        "transition-all duration-300 hover:opacity-100",
      );

      // Add tooltip on hover
      bubble.addEventListener("mouseover", (e) => {
        bubble.setAttribute("opacity", "1");

        const tooltip = document.createElement("div");
        tooltip.textContent = `${xAxis}: ${item[xAxis]}, ${yAxis}: ${item[yAxis]}, ${sizeAxis}: ${item[sizeAxis]}`;
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

      bubble.addEventListener("mousemove", (e) => {
        const tooltip = document.getElementById("chart-tooltip");
        if (tooltip) {
          tooltip.style.left = `${e.pageX + 10}px`;
          tooltip.style.top = `${e.pageY - 30}px`;
        }
      });

      bubble.addEventListener("mouseout", () => {
        bubble.setAttribute("opacity", "0.7");

        const tooltip = document.getElementById("chart-tooltip");
        if (tooltip) {
          document.body.removeChild(tooltip);
        }
      });

      chartGroup.appendChild(bubble);

      // Add label if specified
      if (config.labelAxis) {
        const label = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        label.textContent = item[config.labelAxis]?.toString() || "";
        label.setAttribute("x", x.toString());
        label.setAttribute("y", (y - radius - 5).toString());
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("class", "text-xs text-gray-700");
        chartGroup.appendChild(label);
      }
    });

    // Add y-axis
    const yAxisLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    yAxisLine.setAttribute("x1", "0");
    yAxisLine.setAttribute("y1", "0");
    yAxisLine.setAttribute("x2", "0");
    yAxisLine.setAttribute("y2", chartHeight.toString());
    yAxisLine.setAttribute("stroke", "#e5e7eb");
    chartGroup.appendChild(yAxisLine);

    // Add y-axis ticks and labels
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
      const y = chartHeight * (i / yTickCount);
      const value = yMax - (i / yTickCount) * (yMax - yMin);

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
      label.textContent = value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
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

    // Add x-axis ticks and labels
    const xTickCount = 5;
    for (let i = 0; i <= xTickCount; i++) {
      const x = chartWidth * (i / xTickCount);
      const value = xMin + (i / xTickCount) * (xMax - xMin);

      // Tick line
      const tick = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      tick.setAttribute("x1", x.toString());
      tick.setAttribute("y1", chartHeight.toString());
      tick.setAttribute("x2", x.toString());
      tick.setAttribute("y2", (chartHeight + 5).toString());
      tick.setAttribute("stroke", "#e5e7eb");
      chartGroup.appendChild(tick);

      // Grid line
      const grid = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      grid.setAttribute("x1", x.toString());
      grid.setAttribute("y1", "0");
      grid.setAttribute("x2", x.toString());
      grid.setAttribute("y2", chartHeight.toString());
      grid.setAttribute("stroke", "#f3f4f6");
      grid.setAttribute("stroke-dasharray", "4");
      chartGroup.appendChild(grid);

      // Label
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      label.textContent = value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
      label.setAttribute("x", x.toString());
      label.setAttribute("y", (chartHeight + 20).toString());
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "text-xs text-gray-500");
      chartGroup.appendChild(label);
    }

    // Add legend for bubble size
    const legendGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    legendGroup.setAttribute(
      "transform",
      `translate(${width - 100}, ${padding.top})`,
    );
    svg.appendChild(legendGroup);

    const legendTitle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    legendTitle.textContent = `${sizeAxis} scale`;
    legendTitle.setAttribute("x", "0");
    legendTitle.setAttribute("y", "0");
    legendTitle.setAttribute("class", "text-xs font-medium text-gray-700");
    legendGroup.appendChild(legendTitle);

    // Add small and large bubble examples
    const smallBubble = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    smallBubble.setAttribute("cx", "10");
    smallBubble.setAttribute("cy", "30");
    smallBubble.setAttribute("r", minRadius.toString());
    smallBubble.setAttribute("fill", colors[0]);
    smallBubble.setAttribute("opacity", "0.7");
    legendGroup.appendChild(smallBubble);

    const smallLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    smallLabel.textContent = sizeMin.toLocaleString();
    smallLabel.setAttribute("x", "25");
    smallLabel.setAttribute("y", "34");
    smallLabel.setAttribute("class", "text-xs text-gray-700");
    legendGroup.appendChild(smallLabel);

    const largeBubble = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    largeBubble.setAttribute("cx", "10");
    largeBubble.setAttribute("cy", "70");
    largeBubble.setAttribute("r", maxRadius.toString());
    largeBubble.setAttribute("fill", colors[0]);
    largeBubble.setAttribute("opacity", "0.7");
    legendGroup.appendChild(largeBubble);

    const largeLabel = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    largeLabel.textContent = sizeMax.toLocaleString();
    largeLabel.setAttribute("x", "25");
    largeLabel.setAttribute("y", "74");
    largeLabel.setAttribute("class", "text-xs text-gray-700");
    legendGroup.appendChild(largeLabel);
  };

  return (
    <div
      ref={chartRef}
      className={`w-full h-full min-h-[300px] ${className}`}
      aria-label={`Bubble chart: ${config.title}`}
    />
  );
}
