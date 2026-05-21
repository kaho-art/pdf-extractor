"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileText, Image } from "lucide-react";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFile, disabled }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const ok = file.type.startsWith("image/") || file.type === "application/pdf";
    if (ok) onFile(file);
  }, [onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`
        relative flex flex-col items-center justify-center gap-5
        w-full h-full min-h-[360px] rounded-2xl border-2 border-dashed
        transition-all duration-300 cursor-pointer select-none
        ${dragging
          ? "border-ink-600 bg-paper-200 scale-[1.01]"
          : "border-paper-400 bg-paper-100 hover:border-ink-400 hover:bg-paper-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {/* Decorative grid */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-20 pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 24px,#c4a97f 24px,#c4a97f 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,#c4a97f 24px,#c4a97f 25px)" }} />

      <div className={`relative z-10 w-20 h-20 rounded-2xl bg-paper-50 border border-paper-300 shadow-sm
        flex items-center justify-center transition-transform duration-300 ${dragging ? "scale-110" : ""}`}>
        <Upload size={32} className="text-ink-400" strokeWidth={1.5} />
      </div>

      <div className="relative z-10 text-center space-y-2">
        <p className="font-display font-bold text-ink-700 text-lg tracking-wide">
          ファイルをドロップ
        </p>
        <p className="text-ink-500 text-sm">またはクリックして選択</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-xs text-ink-400 bg-paper-50 border border-paper-300 rounded-full px-3 py-1">
            <FileText size={12} /> PDF
          </span>
          <span className="flex items-center gap-1.5 text-xs text-ink-400 bg-paper-50 border border-paper-300 rounded-full px-3 py-1">
            <Image size={12} /> JPG / PNG
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={disabled}
      />
    </div>
  );
}
