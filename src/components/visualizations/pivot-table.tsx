"use client";

import { useState, useEffect, useRef } from "react";
import { ChartConfig } from "@/lib/visualizations";

interface PivotTableProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}

type PivotData = {
  [rowValue: string]: {
    [colValue: string]: number;
    _rowTotal?: number;
  };
  _colTotals?: { [colValue: string]: number };
  _grandTotal?: number;
};

export default function PivotTable({
  data,
  config,
  className = "",
}: PivotTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [pivotData, setPivotData] = useState<PivotData>({});
  const [rowValues, setRowValues] = useState<string[]>([]);
  const [colValues, setColValues] = useState<string[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const {
      rowField = "category",
      colField = "month",
      valueField = "value",
      aggregation = "sum",
    } = config;

    // Extract unique row and column values
    const uniqueRowValues = Array.from(
      new Set(data.map((item) => String(item[rowField]))),
    ).sort();
    const uniqueColValues = Array.from(
      new Set(data.map((item) => String(item[colField]))),
    ).sort();

    setRowValues(uniqueRowValues);
    setColValues(uniqueColValues);

    // Create pivot data structure
    const pivotResult: PivotData = {};
    const colTotals: { [colValue: string]: number } = {};
    let grandTotal = 0;

    // Initialize data structure
    uniqueRowValues.forEach((rowValue) => {
      pivotResult[rowValue] = {};
      pivotResult[rowValue]._rowTotal = 0;

      uniqueColValues.forEach((colValue) => {
        pivotResult[rowValue][colValue] = 0;
        if (!colTotals[colValue]) colTotals[colValue] = 0;
      });
    });

    // Fill with data
    data.forEach((item) => {
      const rowValue = String(item[rowField]);
      const colValue = String(item[colField]);
      const value = Number(item[valueField]) || 0;

      if (pivotResult[rowValue] && colValue) {
        // Add value based on aggregation type
        if (aggregation === "count") {
          pivotResult[rowValue][colValue] += 1;
          pivotResult[rowValue]._rowTotal! += 1;
          colTotals[colValue] += 1;
          grandTotal += 1;
        } else {
          // Default to sum
          pivotResult[rowValue][colValue] += value;
          pivotResult[rowValue]._rowTotal! += value;
          colTotals[colValue] += value;
          grandTotal += value;
        }
      }
    });

    // Add column totals
    pivotResult._colTotals = colTotals;
    pivotResult._grandTotal = grandTotal;

    setPivotData(pivotResult);
  }, [data, config]);

  useEffect(() => {
    if (!tableRef.current || !pivotData || Object.keys(pivotData).length === 0)
      return;

    renderTable();
  }, [pivotData, rowValues, colValues]);

  const renderTable = () => {
    if (!tableRef.current) return;

    const container = tableRef.current;
    container.innerHTML = ""; // Clear previous table

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

    // Add corner cell
    const cornerCell = document.createElement("th");
    cornerCell.className =
      "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200";
    cornerCell.textContent = config.rowField || "Category";
    headerRow.appendChild(cornerCell);

    // Add column headers
    colValues.forEach((colValue) => {
      const th = document.createElement("th");
      th.className =
        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200";
      th.textContent = colValue;
      headerRow.appendChild(th);
    });

    // Add total column header
    const totalHeader = document.createElement("th");
    totalHeader.className =
      "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200 bg-gray-100";
    totalHeader.textContent = "Total";
    headerRow.appendChild(totalHeader);

    // Create table body
    const tbody = document.createElement("tbody");
    tbody.className = "bg-white divide-y divide-gray-200";
    table.appendChild(tbody);

    // Add data rows
    rowValues.forEach((rowValue, rowIndex) => {
      const row = document.createElement("tr");
      row.className = rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50";
      tbody.appendChild(row);

      // Add row header
      const rowHeader = document.createElement("th");
      rowHeader.className =
        "px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200";
      rowHeader.textContent = rowValue;
      row.appendChild(rowHeader);

      // Add data cells
      colValues.forEach((colValue) => {
        const td = document.createElement("td");
        td.className = "px-4 py-2 text-sm text-gray-900 border border-gray-200";
        const value = pivotData[rowValue]?.[colValue] || 0;
        td.textContent = formatValue(value);
        row.appendChild(td);
      });

      // Add row total
      const rowTotal = document.createElement("td");
      rowTotal.className =
        "px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 bg-gray-100";
      rowTotal.textContent = formatValue(pivotData[rowValue]?._rowTotal || 0);
      row.appendChild(rowTotal);
    });

    // Add totals row
    const totalsRow = document.createElement("tr");
    totalsRow.className = "bg-gray-100 font-medium";
    tbody.appendChild(totalsRow);

    // Add totals header
    const totalsHeader = document.createElement("th");
    totalsHeader.className =
      "px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200";
    totalsHeader.textContent = "Total";
    totalsRow.appendChild(totalsHeader);

    // Add column totals
    colValues.forEach((colValue) => {
      const td = document.createElement("td");
      td.className =
        "px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200";
      const value = pivotData._colTotals?.[colValue] || 0;
      td.textContent = formatValue(value);
      totalsRow.appendChild(td);
    });

    // Add grand total
    const grandTotal = document.createElement("td");
    grandTotal.className =
      "px-4 py-2 text-sm font-bold text-gray-900 border border-gray-200 bg-gray-200";
    grandTotal.textContent = formatValue(pivotData._grandTotal || 0);
    totalsRow.appendChild(grandTotal);

    // Add title if provided
    if (config.title) {
      const titleDiv = document.createElement("div");
      titleDiv.className = "text-sm font-medium mb-4";
      titleDiv.textContent = config.title;
      container.insertBefore(titleDiv, table);
    }
  };

  // Helper function to format values
  const formatValue = (value: number): string => {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  return (
    <div
      ref={tableRef}
      className={`w-full h-full overflow-auto ${className}`}
      aria-label={`Pivot table: ${config.title || "Data Analysis"}`}
    />
  );
}
