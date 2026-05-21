"use client";

import { useState, useCallback } from "react";

export interface SimpleResult {
  pages: { num: number; text: string }[];
  fullText: string;
  totalPages: number;
  charCount: number;
  lineCount: number;
  wordCount: number;
}

export interface SimpleState {
  status: "idle" | "loading" | "done" | "error";
  progress: number;
  message: string;
  error?: string;
}

export function useSimpleExtract() {
  const [file, setFileState] = useState<File | null>(null);
  const [state, setState] = useState<SimpleState>({ status: "idle", progress: 0, message: "" });
  const [result, setResult] = useState<SimpleResult | null>(null);

  const handleFile = useCallback((f: File) => {
    setFileState(f);
    setResult(null);
    setState({ status: "idle", progress: 0, message: "" });
  }, []);

  const clear = useCallback(() => {
    setFileState(null);
    setResult(null);
    setState({ status: "idle", progress: 0, message: "" });
  }, []);

  const extract = useCallback(async () => {
    if (!file) return;
    setState({ status: "loading", progress: 5, message: "PDFを読み込み中..." });
    setResult(null);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      const buf = await file.arrayBuffer();
      setState({ status: "loading", progress: 20, message: "PDFを解析中..." });

      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const total = pdf.numPages;
      const pages: { num: number; text: string }[] = [];

      for (let i = 1; i <= total; i++) {
        setState({
          status: "loading",
          progress: Math.round(20 + (i / total) * 75),
          message: `ページ ${i} / ${total} を処理中...`,
        });
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item: any) => item.str).join(" ");
        pages.push({ num: i, text });
      }

      const fullText = pages.map((p) => `--- ページ ${p.num} ---\n${p.text}`).join("\n\n").trim();
      const charCount = fullText.length;
      const lineCount = fullText.split("\n").length;
      const wordCount = fullText.split(/\s+/).filter(Boolean).length;

      setResult({ pages, fullText, totalPages: total, charCount, lineCount, wordCount });
      setState({ status: "done", progress: 100, message: "完了！" });
    } catch (e: any) {
      setState({ status: "error", progress: 0, message: "", error: e?.message ?? String(e) });
    }
  }, [file]);

  return { file, state, result, handleFile, clear, extract };
}
