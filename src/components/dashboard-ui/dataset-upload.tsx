"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, Check } from "lucide-react";
import { uploadDataset } from "@/lib/visualizations";

interface DatasetUploadProps {
  userId: string;
  onSuccess?: (dataset: any) => void;
}

export default function DatasetUpload({
  userId,
  onSuccess,
}: DatasetUploadProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Dataset name is required");
      return;
    }

    if (!file) {
      setError("Please upload a file");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Read the file
      const fileContent = await readFileAsText(file);

      // Parse CSV data (simple implementation)
      const data = parseCSV(fileContent);

      // Upload dataset
      const result = await uploadDataset(
        name,
        description,
        file.type,
        data,
        userId,
      );

      setSuccess(true);
      setName("");
      setDescription("");
      setFile(null);

      if (onSuccess) {
        onSuccess(result.dataset);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload dataset");
    } finally {
      setIsUploading(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const parseCSV = (text: string): any[] => {
    // Simple CSV parser (for demonstration)
    const lines = text.split("\n");
    const headers = lines[0].split(",").map((header) => header.trim());

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",");
      const row: Record<string, string | number> = {};

      headers.forEach((header, index) => {
        const value = values[index]?.trim() || "";
        // Try to convert to number if possible
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });

      data.push(row);
    }

    return data;
  };

  return (
    <div className="relative overflow-hidden rounded-xl transition-all duration-300">
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-md"></div>

      <div className="relative p-6">
        <h3 className="text-lg font-medium mb-4">Upload Dataset</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dataset-name">Dataset Name</Label>
            <Input
              id="dataset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sales Data 2023"
              className="bg-white/50"
              required
            />
          </div>

          <div>
            <Label htmlFor="dataset-description">Description (Optional)</Label>
            <Textarea
              id="dataset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the dataset"
              className="bg-white/50 resize-none h-20"
            />
          </div>

          <div>
            <Label htmlFor="dataset-file">Upload File (CSV)</Label>

            {!file ? (
              <div className="mt-1">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white/50 hover:bg-white/70 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
            ) : (
              <div className="mt-1 flex items-center p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-700 flex-grow truncate">
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-500 bg-green-50 p-2 rounded-md flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Dataset uploaded successfully!
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Uploading...
              </>
            ) : (
              "Upload Dataset"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
