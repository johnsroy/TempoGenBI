import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-xl">
      {/* Enhanced glassmorphic background */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-xl border border-white/30 shadow-lg transition-all duration-300 group-hover:bg-white/50 group-hover:backdrop-blur-lg"></div>

      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/30 rounded-xl opacity-70"></div>

      {/* Enhanced decorative elements */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-all duration-300"></div>
      <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-purple-400/20 rounded-full blur-xl group-hover:bg-purple-400/30 transition-all duration-300"></div>

      {/* Enhanced content */}
      <div className="relative p-8 h-full flex flex-col z-10">
        <div className="text-blue-600 mb-5 p-4 bg-white/60 backdrop-blur-sm rounded-lg inline-block shadow-sm transform transition-all duration-300 group-hover:translate-y-[-2px] group-hover:shadow-md">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-900">
          {title}
        </h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
