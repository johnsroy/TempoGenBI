"use client";

import { useState, useRef, useEffect } from "react";
import { ChartData, getSavedVisualizations } from "@/lib/visualizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Save, Layout, Grid, Trash2, Move } from "lucide-react";
import ChartContainer from "@/components/visualizations/chart-container";

interface DashboardBuilderProps {
  userId: string;
}

interface DashboardItem {
  id: string;
  visualization: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export default function DashboardBuilder({ userId }: DashboardBuilderProps) {
  const [dashboardName, setDashboardName] = useState("My Dashboard");
  const [dashboardDescription, setDashboardDescription] = useState("");
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [savedVisualizations, setSavedVisualizations] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Load saved visualizations
  useEffect(() => {
    async function loadVisualizations() {
      try {
        const visualizations = await getSavedVisualizations(userId);
        setSavedVisualizations(visualizations);
      } catch (error) {
        console.error("Error loading visualizations:", error);
      }
    }

    loadVisualizations();
  }, [userId]);

  const handleAddVisualization = (visualization: any) => {
    const newItem: DashboardItem = {
      id: `item-${Date.now()}`,
      visualization,
      position: { x: 20, y: 20 },
      size: { width: 400, height: 300 },
    };

    setItems([...items, newItem]);
    setShowAddDialog(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleDragStart = (e: React.MouseEvent, itemId: string) => {
    if (!dashboardRef.current) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Calculate offset from the item's top-left corner
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const dashboardRect = dashboardRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setDraggedItem(itemId);
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggedItem || !dashboardRef.current) return;

    const dashboardRect = dashboardRef.current.getBoundingClientRect();

    // Calculate new position relative to dashboard
    const newX = e.clientX - dashboardRect.left - dragOffset.x;
    const newY = e.clientY - dashboardRect.top - dragOffset.y;

    // Update item position
    setItems(
      items.map((item) => {
        if (item.id === draggedItem) {
          return {
            ...item,
            position: { x: Math.max(0, newX), y: Math.max(0, newY) },
          };
        }
        return item;
      }),
    );
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSaveDashboard = () => {
    // In a real implementation, this would save the dashboard to the database
    alert(`Dashboard "${dashboardName}" saved successfully!`);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="text-xl font-bold bg-transparent border-none focus:ring-0 p-0 h-auto"
          />
          <Textarea
            value={dashboardDescription}
            onChange={(e) => setDashboardDescription(e.target.value)}
            placeholder="Add a description..."
            className="mt-2 bg-transparent border-none focus:ring-0 p-0 resize-none text-sm text-gray-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Visualization
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Visualization</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {savedVisualizations.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {savedVisualizations.map((viz) => (
                      <div
                        key={viz.id}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleAddVisualization(viz)}
                      >
                        <h3 className="font-medium">{viz.name}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {viz.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No saved visualizations found. Create some visualizations
                    first!
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={handleSaveDashboard}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Dashboard
          </Button>
        </div>
      </div>

      <div
        ref={dashboardRef}
        className="relative bg-gray-50 border border-gray-200 rounded-lg min-h-[600px] p-4"
        onMouseMove={draggedItem ? handleDragMove : undefined}
        onMouseUp={draggedItem ? handleDragEnd : undefined}
        onMouseLeave={draggedItem ? handleDragEnd : undefined}
      >
        {items.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Layout className="h-12 w-12 mb-4" />
            <p>Your dashboard is empty. Add visualizations to get started.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowAddDialog(true)}
            >
              Add Visualization
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="absolute bg-white rounded-lg shadow-md overflow-hidden"
              style={{
                left: `${item.position.x}px`,
                top: `${item.position.y}px`,
                width: `${item.size.width}px`,
                height: `${item.size.height}px`,
                zIndex: draggedItem === item.id ? 10 : 1,
              }}
            >
              <div
                className="p-2 bg-gray-100 flex justify-between items-center cursor-move"
                onMouseDown={(e) => handleDragStart(e, item.id)}
              >
                <div className="flex items-center gap-1">
                  <Move className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {item.visualization.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:text-red-500"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-2 h-[calc(100%-40px)] overflow-auto">
                <ChartContainer
                  chartData={{
                    chartConfig: item.visualization.chart_config,
                    data: item.visualization.data,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
