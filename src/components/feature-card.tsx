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
    <div className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-xl border border-white/30 shadow-lg transition-all duration-300 group-hover:bg-white/40 group-hover:backdrop-blur-lg"></div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-purple-50/20 rounded-xl opacity-70"></div>

      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-purple-400/10 rounded-full blur-xl"></div>

      {/* Content */}
      <div className="relative p-7 h-full flex flex-col z-10">
        <div className="text-blue-600 mb-4 p-3 bg-white/50 backdrop-blur-sm rounded-lg inline-block shadow-sm">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
