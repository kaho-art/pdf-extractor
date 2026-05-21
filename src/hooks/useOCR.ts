"use client";

import { useState, useCallback, useRef } from "react";
import type { OCRResult, OCRSettings, ProcessingState, UploadedFile } from "@/types";
import { renderPageToDataUrl, getPageCount } from "@/lib/ocr/pdf";

const DEFAULT_SETTINGS: OCRSettings = {
  language: "jpn",
  direction: "auto",
  columns: "auto",
  autoDetect: true,
  precision: "balanced",
  engine: "tesseract",
  removeRuby: false,
  excludeHeaderFooter: false,
  outputFormat: "plain",
};

export function useOCR() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [settings, setSettings] = useState<OCRSettings>(DEFAULT_SETTINGS);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: "idle",
    progress: 0,
    message: "",
  });
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const abortRef = useRef(false);

  const handleFileUpload = useCallback(async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";
    if (!isImage && !isPDF) return;

    setProcessingState({ status: "loading", progress: 10, message: "ファイルを読み込み中..." });
    setOcrResult(null);

    try {
      if (isPDF) {
        const pageCount = await getPageCount(file);
        const imageDataUrl = await renderPageToDataUrl(file, 1);
        setUploadedFile({
          file,
          type: "pdf",
          pageCount,
          currentPage: 1,
          imageDataUrl,
        });
      } else {
        const imageDataUrl = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target?.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
        setUploadedFile({ file, type: "image", currentPage: 1, imageDataUrl });
      }

      setProcessingState({ status: "idle", progress: 0, message: "" });
    } catch (e) {
      setProcessingState({ status: "error", progress: 0, message: "", error: String(e) });
    }
  }, []);

  const changePage = useCallback(async (page: number) => {
    if (!uploadedFile || uploadedFile.type !== "pdf") return;
    setProcessingState({ status: "loading", progress: 10, message: "ページを読み込み中..." });

    try {
      const imageDataUrl = await renderPageToDataUrl(uploadedFile.file, page);
      setUploadedFile((prev) => prev ? { ...prev, currentPage: page, imageDataUrl } : prev);
      setProcessingState({ status: "idle", progress: 0, message: "" });
      setOcrResult(null);
    } catch (e) {
      setProcessingState({ status: "error", progress: 0, message: "", error: String(e) });
    }
  }, [uploadedFile]);

  const runOCR = useCallback(async () => {
    if (!uploadedFile) return;
    abortRef.current = false;

    setProcessingState({ status: "processing", progress: 0, message: "OCRを開始中..." });
    setOcrResult(null);

    try {
      const { runTesseractOCR } = await import("@/lib/ocr/tesseract");

      const result = await runTesseractOCR(
        uploadedFile.imageDataUrl,
        settings,
        (progress, message) => {
          if (!abortRef.current) {
            setProcessingState({ status: "processing", progress, message });
          }
        }
      );

      if (!abortRef.current) {
        setOcrResult(result);
        setProcessingState({ status: "done", progress: 100, message: "完了！" });
      }
    } catch (e) {
      setProcessingState({ status: "error", progress: 0, message: "", error: String(e) });
    }
  }, [uploadedFile, settings]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setUploadedFile(null);
    setOcrResult(null);
    setProcessingState({ status: "idle", progress: 0, message: "" });
  }, []);

  return {
    uploadedFile,
    settings,
    setSettings,
    processingState,
    ocrResult,
    handleFileUpload,
    changePage,
    runOCR,
    reset,
  };
}
