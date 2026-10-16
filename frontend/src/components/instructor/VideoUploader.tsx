"use client";

import React, { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileVideo } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface VideoUploaderProps {
  lessonId?: string;
  onUploadSuccess?: (data: any) => void;
  initialFile?: File | null;
}

export default function VideoUploader({ lessonId, onUploadSuccess, initialFile }: VideoUploaderProps) {
  const t = useTranslations("instructor.videoUploader");
  const locale = useLocale();
  const isFrench = locale === "fr";
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
    }
  }, [initialFile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError("");
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/mp4": [".mp4"], "video/webm": [".webm"] },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 1024,
    disabled: isUploading,
  });

  const uploadFile = async () => {
    if (!file) return;
    setIsUploading(true);
    setError("");

    const chunkSize = 5 * 1024 * 1024; // 5MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = crypto.randomUUID();

    try {
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("upload_id", uploadId);
        formData.append("chunk_index", i.toString());
        formData.append("total_chunks", totalChunks.toString());
        formData.append("filename", file.name);
        if (lessonId) {
          formData.append("lesson_id", lessonId);
        }

        const res = await fetchApi("/courses/upload/chunked/", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || (isFrench ? `Échec de l'envoi du segment ${i}` : `Upload failed on chunk ${i}`));
        }
        
        // Calculate progress
        setProgress(Math.round(((i + 1) / totalChunks) * 100));

        if (i === totalChunks - 1) {
          const data = await res.json();
          if (onUploadSuccess) onUploadSuccess(data);
          setFile(null); // Reset after successful upload
        }
      }
    } catch (err: any) {
      setError(err.message || (isFrench ? "Une erreur est survenue lors de l'envoi." : "An error occurred during upload."));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {!file ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors cursor-pointer ${
            isDragActive
              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {isDragActive ? t("dragPrompt") : t("dropPrompt")}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t("formatsAndLimit")}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                <FileVideo className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px] sm:max-w-[300px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {!isUploading && (
              <button
                onClick={() => setFile(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {isUploading && (
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">{t("uploading")}</span>
                <span className="font-medium text-brand-600 dark:text-brand-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                <div 
                  className="h-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          {!isUploading && (
            <button
              onClick={uploadFile}
              className="mt-2 w-full rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            >
              {isFrench ? "Démarrer l'envoi" : "Start Upload"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
