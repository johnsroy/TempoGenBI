"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/client";
import {
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Database,
  Plus,
  Upload,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import DashboardHeader from "@/components/dashboard-ui/dashboard-header";
import QueryInput from "@/components/dashboard-ui/query-input";
import VisualizationCard from "@/components/dashboard-ui/visualization-card";
import DatasetUpload from "@/components/dashboard-ui/dataset-upload";
import BarChart from "@/components/visualizations/bar-chart";
import LineChart from "@/components/visualizations/line-chart";
import PieChart from "@/components/visualizations/pie-chart";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [visualizations, setVisualizations] = useState<any[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activeVisualization, setActiveVisualization] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/sign-in");
        return;
      }
      setUser(data.user);
      setLoading(false);
    }

    getUser();
  }, [supabase, router]);

  useEffect(() => {
    if (!user) return;

    // Fetch datasets
    async function fetchDatasets() {
      const { data, error } = await supabase
        .from("datasets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDatasets(data);
      }
    }

    // Fetch visualizations
    async function fetchVisualizations() {
      const { data, error } = await supabase
        .from("visualizations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setVisualizations(data);
      }
    }

    fetchDatasets();
    fetchVisualizations();
  }, [user, supabase]);

  const handleDatasetUploaded = (dataset: any) => {
    setDatasets([dataset, ...datasets]);
    setShowUploadDialog(false);
  };

  const handleVisualizationCreated = (chartData: any) => {
    setActiveVisualization(chartData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Sample data for visualizations
  const sampleBarData = [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 1800 },
    { month: "Mar", revenue: 1400 },
    { month: "Apr", revenue: 2200 },
    { month: "May", revenue: 2600 },
    { month: "Jun", revenue: 3100 },
  ];

  const sampleLineData = [
    { month: "Jan", users: 450 },
    { month: "Feb", users: 550 },
    { month: "Mar", users: 600 },
    { month: "Apr", users: 700 },
    { month: "May", users: 850 },
    { month: "Jun", users: 950 },
  ];

  const samplePieData = [
    { segment: "Enterprise", value: 45 },
    { segment: "SMB", value: 30 },
    { segment: "Consumer", value: 25 },
  ];

  return (
    <SubscriptionCheck>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50">
        <DashboardNavbar />
        <DashboardHeader />

        <main className="w-full relative">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* Query Input Section */}
            <section className="mb-12 pt-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Ask Questions About Your Data
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Use natural language to generate visualizations instantly
                </p>
              </div>
              <QueryInput
                userId={user.id}
                onVisualizationCreated={handleVisualizationCreated}
              />
            </section>

            {/* Recent Visualizations */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Recent Visualizations
                </h2>
                <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>New Visualization</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <VisualizationCard
                  title="Monthly Revenue"
                  description="Last 6 months revenue breakdown"
                  chartType="bar"
                  data={sampleBarData}
                >
                  <BarChart
                    data={sampleBarData}
                    config={{
                      type: "bar",
                      title: "Monthly Revenue",
                      xAxis: "month",
                      yAxis: "revenue",
                      colors: ["#4F46E5"],
                    }}
                  />
                </VisualizationCard>

                <VisualizationCard
                  title="User Growth"
                  description="New users acquisition trend"
                  chartType="line"
                  data={sampleLineData}
                >
                  <LineChart
                    data={sampleLineData}
                    config={{
                      type: "line",
                      title: "User Growth",
                      xAxis: "month",
                      yAxis: "users",
                      colors: ["#10B981"],
                    }}
                  />
                </VisualizationCard>

                <VisualizationCard
                  title="Market Segments"
                  description="Customer distribution by segment"
                  chartType="pie"
                  data={samplePieData}
                >
                  <PieChart
                    data={samplePieData}
                    config={{
                      type: "pie",
                      title: "Market Segments",
                      xAxis: "segment",
                      series: ["value"],
                      colors: ["#8B5CF6", "#EC4899", "#F59E0B"],
                    }}
                  />
                </VisualizationCard>
              </div>
            </section>

            {/* Data Sources */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Data Sources
                </h2>
                <Dialog
                  open={showUploadDialog}
                  onOpenChange={setShowUploadDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Dataset</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Dataset</DialogTitle>
                    </DialogHeader>
                    <DatasetUpload
                      userId={user.id}
                      onSuccess={handleDatasetUploaded}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {datasets.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className="relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-md"></div>
                      <div className="relative p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-blue-100/50 rounded-lg">
                            <Database className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {dataset.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {dataset.row_count} rows
                            </p>
                          </div>
                        </div>
                        {dataset.description && (
                          <p className="text-sm text-gray-600 mb-4">
                            {dataset.description}
                          </p>
                        )}
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600"
                          >
                            Explore
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg">
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-md"></div>

                  <div className="relative p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-blue-100/50 rounded-lg">
                        <Database className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          Connected Data Sources
                        </h3>
                        <p className="text-sm text-gray-500">
                          Manage your data connections
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/50 rounded-lg p-4 text-center py-12">
                      <p className="text-gray-500 mb-4">
                        No data sources connected yet
                      </p>
                      <Button
                        onClick={() => setShowUploadDialog(true)}
                        className="inline-flex items-center px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-all text-sm font-medium shadow-md"
                      >
                        Upload Your First Dataset
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </SubscriptionCheck>
  );
}
