"use client";

import React, { useState } from "react";
import { ScanText, RefreshCw, Play, AlertCircle, Zap, ScanLine } from "lucide-react";
import { useOCR } from "@/hooks/useOCR";
import { SettingsPanel } from "@/components/ocr/SettingsPanel";
import { DropZone } from "@/components/ocr/DropZone";
import { ImageViewer } from "@/components/ocr/ImageViewer";
import { ResultPanel } from "@/components/ocr/ResultPanel";
import { ProcessingOverlay } from "@/components/ocr/ProcessingOverlay";
import { SimpleMode } from "@/components/ocr/SimpleMode";

type Mode = "simple" | "ocr";

export default function Home() {
  const [mode, setMode] = useState<Mode>("simple");

  const {
    uploadedFile, settings, setSettings, processingState,
    ocrResult, handleFileUpload, changePage, runOCR, reset,
  } = useOCR();

  const [highlightedBlock, setHighlightedBlock] = useState<number | null>(null);
  const isProcessing = processingState.status === "processing" || processingState.status === "loading";
  const hasFile = !!uploadedFile;
  const hasResult = !!ocrResult;

  return (
    <div className="h-screen flex flex-col bg-ink-900 text-ink-100 overflow-hidden font-sans">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 bg-ink-800 border-b border-ink-700 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-paper-400 flex items-center justify-center">
            <ScanText size={16} className="text-ink-900" />
          </div>
          <div>
            <h1 className="font-display font-black text-paper-100 text-sm tracking-widest uppercase">OCR Studio</h1>
            <p className="text-ink-400 text-[10px] tracking-wide">日本語・多段組み対応テキスト抽出</p>
          </div>
        </div>

        {/* Mode switcher — centre */}
        <div className="flex items-center bg-ink-700 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode("simple")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
              ${mode === "simple" ? "bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow" : "text-ink-400 hover:text-ink-200"}`}
          >
            <Zap size={12} /> シンプル抽出
          </button>
          <button
            onClick={() => setMode("ocr")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
              ${mode === "ocr" ? "bg-paper-400 text-ink-900 shadow" : "text-ink-400 hover:text-ink-200"}`}
          >
            <ScanLine size={12} /> OCR フル機能
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 w-48 justify-end">
          <a
            href="https://www.ilovepdf.com/ja"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
              bg-ink-700 text-ink-300 hover:bg-ink-600 hover:text-paper-100 transition-colors whitespace-nowrap"
          >
            🔗 iLovePDF
          </a>
          {mode === "ocr" && hasFile && (
            <button onClick={reset}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                bg-ink-700 text-ink-300 hover:bg-ink-600 hover:text-paper-100 transition-colors">
              <RefreshCw size={12} /> リセット
            </button>
          )}
          {mode === "ocr" && (
            <button onClick={runOCR} disabled={!hasFile || isProcessing}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-lg
                bg-paper-400 text-ink-900 hover:bg-paper-300
                disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow">
              <Play size={14} fill="currentColor" /> OCR 実行
            </button>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════ Simple mode ════ */}
        {mode === "simple" && <SimpleMode />}

        {/* ════ OCR full mode ════ */}
        {mode === "ocr" && (
          <>
            <SettingsPanel settings={settings} onChange={setSettings} disabled={isProcessing} />

            {!hasFile ? (
              <div className="flex-1 flex items-center justify-center p-12 bg-ink-900">
                <div className="w-full max-w-xl animate-fade-in">
                  <DropZone onFile={handleFileUpload} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative overflow-hidden">
                  <ImageViewer
                    imageUrl={uploadedFile.imageDataUrl}
                    pageCount={uploadedFile.pageCount}
                    currentPage={uploadedFile.currentPage}
                    onPageChange={changePage}
                    ocrResult={ocrResult}
                    highlightedBlock={highlightedBlock}
                    onBlockClick={setHighlightedBlock}
                  />
                  <ProcessingOverlay state={processingState} />
                </div>

                {hasResult && (
                  <div className="w-96 border-l border-ink-700 overflow-hidden animate-slide-up">
                    <ResultPanel
                      result={ocrResult!}
                      highlightedBlock={highlightedBlock}
                      onBlockHover={setHighlightedBlock}
                      onBlockClick={setHighlightedBlock}
                    />
                  </div>
                )}

                {!hasResult && processingState.status === "idle" && (
                  <div className="w-96 border-l border-ink-700 flex flex-col items-center justify-center gap-4 bg-paper-50 text-ink-400">
                    <Play size={36} strokeWidth={1} className="text-ink-300" />
                    <p className="text-sm text-center leading-relaxed px-8">
                      「OCR 実行」ボタンを押すと<br />ここにテキストが表示されます
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Error toast */}
      {mode === "ocr" && processingState.status === "error" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-3 px-5 py-3 rounded-xl bg-red-900 border border-red-700
          text-red-100 text-sm shadow-xl animate-slide-up">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span>{processingState.error ?? "エラーが発生しました"}</span>
        </div>
      )}
    </div>
  );
}
