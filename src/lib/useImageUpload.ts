"use client";

import { useState, useCallback } from "react";
import { ImageKind } from "@prisma/client";
import { compressImage, formatByteSize } from "./imageCompress";

export interface UploadedImageState {
  id: string;
  previewUrl: string;
  originalSize: string;
  compressedSize: string;
  width: number;
  height: number;
}

export type UploadStep = "idle" | "compressing" | "uploading" | "done" | "error";

export interface UseImageUploadReturn {
  step: UploadStep;
  progressText: string;
  errorMessage: string | null;
  uploadedImages: UploadedImageState[];
  isProcessing: boolean;
  uploadSingle: (file: File, kind: ImageKind) => Promise<string | null>;
  uploadMultiple: (files: File[], kind: ImageKind, maxAllowed?: number) => Promise<string[]>;
  removeImage: (id: string) => void;
  clearAll: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [step, setStep] = useState<UploadStep>("idle");
  const [progressText, setProgressText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageState[]>([]);

  const uploadSingleBlob = async (
    fullBlob: Blob,
    thumbBlob: Blob,
    kind: ImageKind,
    width: number,
    height: number
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("image", fullBlob, "image.webp");
    formData.append("thumb", thumbBlob, "thumb.webp");
    formData.append("kind", kind);
    formData.append("width", width.toString());
    formData.append("height", height.toString());

    const response = await fetch("/api/images", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || `Upload failed with status code ${response.status}`);
    }

    const result = await response.json();
    return result.id;
  };

  const uploadSingle = useCallback(
    async (file: File, kind: ImageKind): Promise<string | null> => {
      setErrorMessage(null);
      let previewUrl = "";
      try {
        setStep("compressing");
        setProgressText("Compressing...");

        const compressed = await compressImage(file, kind);
        previewUrl = URL.createObjectURL(compressed.thumbBlob);

        setStep("uploading");
        setProgressText("Uploading...");

        const imageId = await uploadSingleBlob(
          compressed.fullBlob,
          compressed.thumbBlob,
          kind,
          compressed.width,
          compressed.height
        );

        const newEntry: UploadedImageState = {
          id: imageId,
          previewUrl,
          originalSize: formatByteSize(compressed.originalSizeBytes),
          compressedSize: formatByteSize(compressed.sizeBytes),
          width: compressed.width,
          height: compressed.height,
        };

        setUploadedImages((prev) => [...prev, newEntry]);
        setStep("done");
        setProgressText("");
        return imageId;
      } catch (err: any) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setStep("error");
        setErrorMessage(err.message || "An unexpected error occurred while preparing the image.");
        return null;
      }
    },
    []
  );

  const uploadMultiple = useCallback(
    async (files: File[], kind: ImageKind, maxAllowed = 4): Promise<string[]> => {
      setErrorMessage(null);
      const totalToProcess = files.slice(0, maxAllowed);
      const successfulIds: string[] = [];

      for (let i = 0; i < totalToProcess.length; i++) {
        const file = totalToProcess[i];
        let previewUrl = "";
        try {
          setStep("compressing");
          setProgressText(`Compressing photo ${i + 1} of ${totalToProcess.length}...`);

          const compressed = await compressImage(file, kind);
          previewUrl = URL.createObjectURL(compressed.thumbBlob);

          setStep("uploading");
          setProgressText(`Uploading photo ${i + 1} of ${totalToProcess.length}...`);

          const imageId = await uploadSingleBlob(
            compressed.fullBlob,
            compressed.thumbBlob,
            kind,
            compressed.width,
            compressed.height
          );

          successfulIds.push(imageId);
          const newEntry: UploadedImageState = {
            id: imageId,
            previewUrl,
            originalSize: formatByteSize(compressed.originalSizeBytes),
            compressedSize: formatByteSize(compressed.sizeBytes),
            width: compressed.width,
            height: compressed.height,
          };
          setUploadedImages((prev) => [...prev, newEntry]);
        } catch (err: any) {
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          setStep("error");
          setErrorMessage(err.message || `Failed to process ${file.name}.`);
          break;
        }
      }

      setStep(successfulIds.length > 0 ? "done" : "idle");
      setProgressText("");
      return successfulIds;
    },
    []
  );

  const removeImage = useCallback((id: string) => {
    setUploadedImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setUploadedImages((prev) => {
      prev.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      return [];
    });
    setStep("idle");
    setProgressText("");
    setErrorMessage(null);
  }, []);

  return {
    step,
    progressText,
    errorMessage,
    uploadedImages,
    isProcessing: step === "compressing" || step === "uploading",
    uploadSingle,
    uploadMultiple,
    removeImage,
    clearAll,
  };
}
