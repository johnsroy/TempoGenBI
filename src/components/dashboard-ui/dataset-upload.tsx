"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, Check, AlertCircle } from "lucide-react";
import { uploadChunkedDataset } from "@/lib/visualizations";

interface DatasetUploadProps {
  userId: string;
  onSuccess?: (dataset: any) => void;
}

// Constants for chunked upload
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(
          `File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`,
        );
        return;
      }

      // Validate file type
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (fileExtension !== "csv") {
        setError(
          "Only CSV files are supported. Please upload a file with .csv extension.",
        );
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setProcessingStatus("");
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
    setUploadProgress(0);
    setProcessingStatus("Preparing file for upload...");

    try {
      // For large files, use chunked upload
      if (file.size > CHUNK_SIZE) {
        const result = await uploadChunkedDataset(
          name,
          description,
          file,
          userId,
          (progress) => {
            setUploadProgress(progress);
            if (progress < 100) {
              setProcessingStatus(`Uploading chunks: ${Math.round(progress)}%`);
            } else {
              setProcessingStatus("Processing data...");
            }
          },
        );

        setSuccess(true);
        setName("");
        setDescription("");
        setFile(null);
        setUploadProgress(0);
        setProcessingStatus("");

        if (onSuccess) {
          onSuccess(result.dataset);
        }
      } else {
        // For smaller files, use the simpler approach with streaming
        setProcessingStatus("Reading file...");
        const { data, headers } = await readCSVFile(file);

        setProcessingStatus("Uploading dataset...");
        setUploadProgress(50); // Set to 50% when file is read and ready to upload

        const result = await uploadChunkedDataset(
          name,
          description,
          file,
          userId,
          (progress) => {
            // Scale progress from 50% to 100%
            setUploadProgress(50 + progress / 2);
            if (progress < 100) {
              setProcessingStatus(
                `Uploading: ${Math.round(50 + progress / 2)}%`,
              );
            } else {
              setProcessingStatus("Processing data...");
            }
          },
          data,
          headers,
        );

        setSuccess(true);
        setName("");
        setDescription("");
        setFile(null);
        setUploadProgress(0);
        setProcessingStatus("");

        if (onSuccess) {
          onSuccess(result.dataset);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload dataset");
      setUploadProgress(0);
      setProcessingStatus("");
    } finally {
      setIsUploading(false);
    }
  };

  const readCSVFile = useCallback(
    async (file: File): Promise<{ data: any[]; headers: string[] }> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            if (event.target?.result) {
              const text = event.target.result as string;
              const lines = text.split("\n");
              const headers = lines[0]
                .split(",")
                .map((header) => header.trim());

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

              resolve({ data, headers });
            } else {
              reject(new Error("Failed to read file"));
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });
    },
    [],
  );

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
                    <p className="text-xs text-gray-500 mt-1">
                      CSV files only (up to 10GB)
                    </p>
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
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700 flex-grow truncate">
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
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

                {uploadProgress > 0 && (
                  <div className="w-full">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    {processingStatus && (
                      <p className="text-xs text-gray-500 mt-1">
                        {processingStatus}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
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
            disabled={isUploading || !file}
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {processingStatus || "Uploading..."}
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
