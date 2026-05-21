"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileText, Copy, Download, CheckCheck, X, Sparkles } from "lucide-react";
import { useSimpleExtract } from "@/hooks/useSimpleExtract";

export function SimpleMode() {
  const { file, state, result, handleFile, clear, extract } = useSimpleExtract();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") handleFile(f);
  }, [handleFile]);

  const onCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.fullText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = result.fullText;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSave = () => {
    if (!result || !file) return;
    const blob = new Blob([result.fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, "") + "_text.txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const isLoading = state.status === "loading";

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Drop zone */}
        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`
              relative rounded-3xl border-2 border-dashed p-16 text-center cursor-pointer
              transition-all duration-200 select-none
              ${dragging
                ? "border-purple-400 bg-purple-50 scale-[1.01] shadow-lg"
                : "border-purple-200 bg-white/70 hover:border-purple-300 hover:bg-white/90"}
            `}
          >
            {/* grid decoration */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-10 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle, #9575cd 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

            <div className="relative z-10 space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-pink-200 to-purple-300
                flex items-center justify-center shadow-md transition-transform duration-200
                ${dragging ? "scale-110" : ""}`}>
                <Upload size={32} className="text-purple-700" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-bold text-purple-700 mb-1">PDFをドラッグ＆ドロップ</p>
                <p className="text-sm text-purple-400">またはクリックして選択</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-purple-400
                bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
                <FileText size={11} /> PDF形式のみ
              </span>
            </div>
            <input ref={inputRef} type="file" className="hidden" accept=".pdf,application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        ) : (
          /* File card */
          <div className="rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100
            border border-purple-200 px-5 py-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-300 to-purple-400
              flex items-center justify-center text-white text-lg shadow shrink-0">📕</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-purple-900 truncate">{file.name}</p>
              <p className="text-xs text-purple-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={clear}
              className="w-8 h-8 rounded-full bg-white border border-purple-200
                flex items-center justify-center text-purple-400 hover:text-red-400 hover:border-red-200
                transition-colors shrink-0">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Extract button */}
        {file && !result && (
          <button
            onClick={extract}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base
              bg-gradient-to-r from-purple-400 to-pink-400
              hover:from-purple-500 hover:to-pink-500
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg hover:shadow-xl transition-all duration-200
              flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            {isLoading ? "処理中..." : "✨ テキストを抽出する"}
          </button>
        )}

        {/* Progress */}
        {isLoading && (
          <div className="rounded-2xl bg-white/80 border border-purple-100 px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
              <span className="text-sm font-medium text-purple-700">{state.message}</span>
            </div>
            <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            <p className="text-right text-xs text-purple-400 mt-1">{state.progress}%</p>
          </div>
        )}

        {/* Error */}
        {state.status === "error" && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
            ⚠️ {state.error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-[fadeIn_0.4s_ease_forwards]">
            {/* Stats */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: "📄", label: `${result.totalPages}ページ` },
                { icon: "🔤", label: `${result.charCount.toLocaleString()}文字` },
                { icon: "📝", label: `${result.lineCount.toLocaleString()}行` },
                { icon: "💬", label: `${result.wordCount.toLocaleString()}単語` },
              ].map((s) => (
                <span key={s.label}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full
                    bg-gradient-to-r from-purple-100 to-pink-100
                    border border-purple-200 text-purple-700">
                  {s.icon} {s.label}
                </span>
              ))}
            </div>

            {/* Text box */}
            <div className="rounded-2xl bg-white/90 border border-purple-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3
                border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <span className="text-sm font-bold text-purple-700">🎉 抽出完了！</span>
                <div className="flex gap-2">
                  <button onClick={onCopy}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full
                      bg-gradient-to-r from-cyan-100 to-teal-100 text-teal-700
                      border border-teal-200 hover:brightness-95 transition-all">
                    {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                    {copied ? "コピー済み" : "コピー"}
                  </button>
                  <button onClick={onSave}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full
                      bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700
                      border border-emerald-200 hover:brightness-95 transition-all">
                    <Download size={12} /> 保存
                  </button>
                </div>
              </div>
              <pre className="px-5 py-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap
                max-h-[420px] overflow-y-auto font-sans
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-thumb]:bg-purple-200
                [&::-webkit-scrollbar-thumb]:rounded-full">
                {result.fullText}
              </pre>
            </div>

            {/* Extract again */}
            <button onClick={clear}
              className="w-full py-3 rounded-2xl text-sm font-semibold
                bg-white border-2 border-purple-200 text-purple-500
                hover:border-purple-400 hover:text-purple-700 transition-colors">
              別のPDFを読み込む
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
