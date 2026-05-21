"use client";

import React, { useState, useRef } from "react";
import { Copy, Download, CheckCheck, ChevronDown, ChevronUp } from "lucide-react";
import type { OCRResult } from "@/types";

interface ResultPanelProps {
  result: OCRResult;
  highlightedBlock: number | null;
  onBlockHover: (index: number | null) => void;
  onBlockClick: (index: number) => void;
}

export function ResultPanel({ result, highlightedBlock, onBlockHover, onBlockClick }: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (textRef.current) {
        textRef.current.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = { plain: "txt", markdown: "md", json: "json" };
    const fmt: string = result.outputFormat ?? "plain";
    const ext = extMap[fmt] ?? "txt";
    const blob = new Blob([result.fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr_result.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-paper-50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-paper-300 bg-paper-100 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-ink-700 text-sm tracking-wide">抽出テキスト</span>
          <div className="flex items-center gap-2 text-[11px] text-ink-400">
            <span className="bg-paper-200 rounded-full px-2 py-0.5">
              {result.blocks.length}ブロック
            </span>
            <span className="bg-paper-200 rounded-full px-2 py-0.5">
              {result.detectedDirection ?? "—"}
            </span>
            <span className="bg-paper-200 rounded-full px-2 py-0.5">
              {result.detectedColumns ?? "—"}段組み
            </span>
            <span className="bg-paper-200 rounded-full px-2 py-0.5">
              {Math.round(result.confidence)}% 信頼度
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
              bg-paper-200 text-ink-700 hover:bg-paper-300 border border-paper-300 transition-colors"
          >
            {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
            {copied ? "コピー済み" : "コピー"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
              bg-ink-700 text-paper-100 hover:bg-ink-800 transition-colors"
          >
            <Download size={13} /> 保存
          </button>
        </div>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {result.blocks.map((block, i) => (
          <div
            key={i}
            onMouseEnter={() => onBlockHover(i)}
            onMouseLeave={() => onBlockHover(null)}
            onClick={() => onBlockClick(i)}
            className={`group rounded-xl border px-4 py-3 cursor-pointer transition-all duration-150
              ${highlightedBlock === i
                ? "border-accent-red bg-red-50 shadow-sm"
                : "border-paper-300 bg-white hover:border-ink-400 hover:shadow-sm"}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5
                ${highlightedBlock === i ? "bg-accent-red text-white" : "bg-paper-200 text-ink-500"}`}>
                #{i + 1}
              </span>
              <span className="text-[10px] text-ink-400">段{block.column + 1}</span>
              <span className="text-[10px] text-ink-400 ml-auto">
                {Math.round(block.lines[0]?.confidence ?? 0)}% 信頼度
              </span>
            </div>
            <p className="text-sm text-ink-800 leading-relaxed font-sans whitespace-pre-wrap line-clamp-4">
              {block.text}
            </p>
          </div>
        ))}
      </div>

      {/* Raw text toggle */}
      <div className="border-t border-paper-300 bg-paper-100 shrink-0">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full flex items-center justify-between px-5 py-2.5
            text-xs text-ink-500 hover:text-ink-700 transition-colors"
        >
          <span>全文テキスト表示</span>
          {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showRaw && (
          <textarea
            ref={textRef}
            readOnly
            value={result.fullText}
            className="w-full h-48 px-5 pb-4 bg-paper-100 text-ink-700 text-xs
              font-mono leading-relaxed resize-none focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}
