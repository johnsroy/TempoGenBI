"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  BarChart2,
  PieChart,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { processQuery } from "@/lib/visualizations";
import ChartContainer from "@/components/visualizations/chart-container";

interface QueryInputProps {
  userId: string;
  onVisualizationCreated?: (chartData: any) => void;
}

export default function QueryInput({
  userId,
  onVisualizationCreated,
}: QueryInputProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions] = useState([
    "Show me total sales by region",
    "What were my top 5 products last month?",
    "Compare revenue year over year",
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await processQuery(query, userId);
      setChartData(result);

      if (onVisualizationCreated) {
        onVisualizationCreated(result);
      }
    } catch (err) {
      console.error("Error processing query:", err);
      setError(err instanceof Error ? err.message : "Failed to process query");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Enhanced glassmorphic background */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg"></div>

      <form
        onSubmit={handleSubmit}
        className="relative p-5 flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your data..."
            className="flex-grow bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 py-2"
            disabled={isLoading}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-lg px-4 py-2 text-sm transition-all shadow-md shadow-blue-500/10"
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Query suggestions */}
        {!query && !isLoading && !chartData && (
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs text-gray-500 mr-1 flex items-center">
              Try asking:
            </span>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-white/70 hover:bg-white/90 text-blue-600 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
              >
                {index === 0 ? (
                  <BarChart2 className="h-3 w-3" />
                ) : index === 1 ? (
                  <PieChart className="h-3 w-3" />
                ) : (
                  <LineChart className="h-3 w-3" />
                )}
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}
      </form>

      {chartData && (
        <div className="mt-6">
          <ChartContainer chartData={chartData} />
        </div>
      )}
    </div>
  );
}
