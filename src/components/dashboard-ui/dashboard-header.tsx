"use client";

import { MessageSquare, BarChart3, Settings, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DashboardHeader() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Glassmorphic header */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm z-10"></div>

      <div className="relative flex items-center justify-between p-4 z-20">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            GenBI Dashboard
          </h1>
        </div>

        <div className="relative max-w-md w-full mx-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search visualizations..."
            className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-white/80 transition-colors">
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/80 transition-colors">
            <BarChart3 className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/80 transition-colors">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
