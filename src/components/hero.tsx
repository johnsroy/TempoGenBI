import Link from "next/link";
import { ArrowUpRight, Check, MessageSquare } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Enhanced background gradient for glassmorphic effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 opacity-80" />

      {/* Animated decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Enhanced title with more prominent gradient */}
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                GenBI
              </span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
                Generative BI Platform
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform your data into actionable insights with natural language
              queries. Ask questions in plain English and get beautiful,
              interactive visualizations instantly.
            </p>

            {/* Enhanced glassmorphic chat input preview */}
            <div className="relative max-w-2xl mx-auto mb-12 group transform transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-white/50 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg group-hover:bg-white/60 group-hover:shadow-xl transition-all duration-300"></div>
              <div className="relative flex items-center p-5 rounded-xl">
                <MessageSquare className="w-5 h-5 text-blue-500 mr-3" />
                <p className="text-gray-500 text-left">
                  What were my total sales by region last quarter?
                </p>
                <button className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-blue-500/10">
                  Generate
                </button>
              </div>
            </div>

            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-all text-lg font-medium shadow-lg shadow-blue-500/20 transform hover:translate-y-[-2px]"
              >
                Try GenBI Now
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-all text-lg font-medium border border-gray-100 shadow-md transform hover:translate-y-[-2px]"
              >
                View Pricing
              </Link>
            </div>

            {/* Enhanced feature list */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <Check className="w-5 h-5 text-green-500" />
                <span>Natural language queries</span>
              </div>
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <Check className="w-5 h-5 text-green-500" />
                <span>Interactive visualizations</span>
              </div>
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <Check className="w-5 h-5 text-green-500" />
                <span>No coding required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
