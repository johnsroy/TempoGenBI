"use client";

import { useEffect, useRef } from "react";
import { ChartConfig } from "@/lib/visualizations";

interface TableProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}

export default function Table({ data, config, className = "" }: TableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tableRef.current || !data || data.length === 0) return;

    renderTable();
  }, [data, config]);

  const renderTable = () => {
    if (!tableRef.current) return;

    const container = tableRef.current;
    container.innerHTML = ""; // Clear previous table

    // Get columns from first data item or from config
    const columns = config.columns || Object.keys(data[0] || {});

    // Create table element
    const table = document.createElement("table");
    table.className = "w-full border-collapse";
    container.appendChild(table);

    // Create table header
    const thead = document.createElement("thead");
    thead.className = "bg-gray-50 sticky top-0";
    table.appendChild(thead);

    const headerRow = document.createElement("tr");
    thead.appendChild(headerRow);

    // Add header cells
    columns.forEach((column) => {
      const th = document.createElement("th");
      th.className =
        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
      th.textContent = column;

      // Add sort functionality
      th.addEventListener("click", () => {
        sortTable(column);
      });
      th.style.cursor = "pointer";

      headerRow.appendChild(th);
    });

    // Create table body
    const tbody = document.createElement("tbody");
    tbody.className = "bg-white divide-y divide-gray-200";
    table.appendChild(tbody);

    // Add data rows
    data.forEach((item, rowIndex) => {
      const row = document.createElement("tr");
      row.className = rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50";
      row.classList.add("hover:bg-gray-100", "transition-colors");
      tbody.appendChild(row);

      // Add cells
      columns.forEach((column) => {
        const td = document.createElement("td");
        td.className = "px-4 py-2 text-sm text-gray-900";
        td.textContent = item[column] !== undefined ? String(item[column]) : "";
        row.appendChild(td);
      });
    });

    // Add title if provided
    if (config.title) {
      const titleDiv = document.createElement("div");
      titleDiv.className = "text-sm font-medium mb-4";
      titleDiv.textContent = config.title;
      container.insertBefore(titleDiv, table);
    }

    // Function to sort table
    function sortTable(column: string) {
      const sortedData = [...data].sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];

        // Handle different data types
        if (typeof valueA === "number" && typeof valueB === "number") {
          return valueA - valueB;
        }

        // Default to string comparison
        return String(valueA).localeCompare(String(valueB));
      });

      // Clear and re-render with sorted data
      tbody.innerHTML = "";

      sortedData.forEach((item, rowIndex) => {
        const row = document.createElement("tr");
        row.className = rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50";
        row.classList.add("hover:bg-gray-100", "transition-colors");
        tbody.appendChild(row);

        columns.forEach((col) => {
          const td = document.createElement("td");
          td.className = "px-4 py-2 text-sm text-gray-900";
          td.textContent = item[col] !== undefined ? String(item[col]) : "";
          row.appendChild(td);
        });
      });
    }

    // Add search functionality
    const searchDiv = document.createElement("div");
    searchDiv.className = "mb-4";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search...";
    searchInput.className =
      "px-3 py-2 border border-gray-300 rounded-md text-sm w-full max-w-xs";

    searchInput.addEventListener("input", (e) => {
      const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();

      const rows = tbody.querySelectorAll("tr");
      rows.forEach((row) => {
        const text = row.textContent?.toLowerCase() || "";
        row.style.display = text.includes(searchTerm) ? "" : "none";
      });
    });

    searchDiv.appendChild(searchInput);
    container.insertBefore(searchDiv, table);
  };

  return (
    <div
      ref={tableRef}
      className={`w-full h-full overflow-auto ${className}`}
      aria-label={`Table: ${config.title || "Data Table"}`}
    />
  );
}
