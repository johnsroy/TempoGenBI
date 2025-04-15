"use client";

import { useEffect, useRef } from "react";
import { ChartConfig, getChartColors } from "@/lib/visualizations";

interface PieChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}

export default function PieChart({
  data,
  config,
  className = "",
}: PieChartProps) {
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
      series = ["value"],
      xAxis = "label",
      colors = getChartColors(data.length),
    } = config;

    // Set dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    const padding = 40;
    const radius = Math.min(width, height) / 2 - padding;

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
      `translate(${width / 2}, ${height / 2})`,
    );
    svg.appendChild(chartGroup);

    // Calculate total value
    const total = data.reduce(
      (sum, item) => sum + (Number(item[series[0]]) || 0),
      0,
    );

    // Draw pie slices
    let startAngle = 0;

    data.forEach((item, index) => {
      const value = Number(item[series[0]]) || 0;
      const percentage = value / total;
      const endAngle = startAngle + percentage * 2 * Math.PI;

      // Calculate path
      const x1 = radius * Math.cos(startAngle - Math.PI / 2);
      const y1 = radius * Math.sin(startAngle - Math.PI / 2);
      const x2 = radius * Math.cos(endAngle - Math.PI / 2);
      const y2 = radius * Math.sin(endAngle - Math.PI / 2);

      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M 0 0`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      // Create slice
      const slice = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      slice.setAttribute("d", pathData);
      slice.setAttribute("fill", colors[index % colors.length]);
      slice.setAttribute("stroke", "white");
      slice.setAttribute("stroke-width", "1");
      slice.setAttribute(
        "class",
        "transition-all duration-300 hover:opacity-80",
      );

      // Add tooltip on hover
      slice.addEventListener("mouseover", (e) => {
        // Move slice slightly outward
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const offsetX = Math.cos(midAngle - Math.PI / 2) * 10;
        const offsetY = Math.sin(midAngle - Math.PI / 2) * 10;
        slice.setAttribute("transform", `translate(${offsetX}, ${offsetY})`);

        const tooltip = document.createElement("div");
        tooltip.textContent = `${item[xAxis]}: ${item[series[0]]} (${(percentage * 100).toFixed(1)}%)`;
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

      slice.addEventListener("mousemove", (e) => {
        const tooltip = document.getElementById("chart-tooltip");
        if (tooltip) {
          tooltip.style.left = `${e.pageX + 10}px`;
          tooltip.style.top = `${e.pageY - 30}px`;
        }
      });

      slice.addEventListener("mouseout", () => {
        slice.setAttribute("transform", "");

        const tooltip = document.getElementById("chart-tooltip");
        if (tooltip) {
          document.body.removeChild(tooltip);
        }
      });

      chartGroup.appendChild(slice);

      // Add label if slice is large enough
      if (percentage > 0.05) {
        const labelAngle = startAngle + (endAngle - startAngle) / 2;
        const labelRadius = radius * 0.7;
        const labelX = labelRadius * Math.cos(labelAngle - Math.PI / 2);
        const labelY = labelRadius * Math.sin(labelAngle - Math.PI / 2);

        const label = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        label.textContent = `${(percentage * 100).toFixed(0)}%`;
        label.setAttribute("x", labelX.toString());
        label.setAttribute("y", labelY.toString());
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("dominant-baseline", "middle");
        label.setAttribute("fill", "white");
        label.setAttribute("class", "text-xs font-medium");
        chartGroup.appendChild(label);
      }

      startAngle = endAngle;
    });

    // Add legend
    const legendGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g",
    );
    legendGroup.setAttribute(
      "transform",
      `translate(${width - 100}, ${padding})`,
    );
    svg.appendChild(legendGroup);

    data.forEach((item, index) => {
      const legendItem = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      );
      legendItem.setAttribute("transform", `translate(0, ${index * 20})`);

      // Color box
      const colorBox = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      colorBox.setAttribute("width", "12");
      colorBox.setAttribute("height", "12");
      colorBox.setAttribute("fill", colors[index % colors.length]);
      colorBox.setAttribute("rx", "2");
      legendItem.appendChild(colorBox);

      // Label
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      label.textContent = item[xAxis]?.toString() || "";
      label.setAttribute("x", "16");
      label.setAttribute("y", "10");
      label.setAttribute("class", "text-xs text-gray-700");
      legendItem.appendChild(label);

      legendGroup.appendChild(legendItem);
    });
  };

  return (
    <div
      ref={chartRef}
      className={`w-full h-full min-h-[300px] ${className}`}
      aria-label={`Pie chart: ${config.title}`}
    />
  );
}
