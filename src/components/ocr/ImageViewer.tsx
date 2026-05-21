"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { OCRResult, HighlightedRegion } from "@/types";

interface ImageViewerProps {
  imageUrl: string;
  pageCount?: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
  ocrResult?: OCRResult | null;
  highlightedBlock?: number | null;
  onBlockClick?: (blockIndex: number) => void;
}

export function ImageViewer({
  imageUrl,
  pageCount = 1,
  currentPage,
  onPageChange,
  ocrResult,
  highlightedBlock,
  onBlockClick,
}: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });
  const [imgRenderedSize, setImgRenderedSize] = useState({ w: 0, h: 0 });

  const updateRenderedSize = useCallback(() => {
    if (!imgRef.current) return;
    setImgRenderedSize({ w: imgRef.current.offsetWidth, h: imgRef.current.offsetHeight });
  }, []);

  useEffect(() => {
    const obs = new ResizeObserver(updateRenderedSize);
    if (imgRef.current) obs.observe(imgRef.current);
    return () => obs.disconnect();
  }, [updateRenderedSize]);

  const scaleX = imgNaturalSize.w > 0 ? imgRenderedSize.w / imgNaturalSize.w : 1;
  const scaleY = imgNaturalSize.h > 0 ? imgRenderedSize.h / imgNaturalSize.h : 1;

  return (
    <div className="flex flex-col h-full bg-ink-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-ink-800 border-b border-ink-700 shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => setScale((s) => Math.max(0.3, s - 0.2))}
            className="p-1.5 rounded text-ink-300 hover:text-paper-100 hover:bg-ink-700 transition-colors">
            <ZoomOut size={15} />
          </button>
          <span className="text-xs text-ink-400 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.2))}
            className="p-1.5 rounded text-ink-300 hover:text-paper-100 hover:bg-ink-700 transition-colors">
            <ZoomIn size={15} />
          </button>
          <button onClick={() => setScale(1)}
            className="p-1.5 rounded text-ink-300 hover:text-paper-100 hover:bg-ink-700 transition-colors ml-1">
            <RotateCcw size={14} />
          </button>
        </div>

        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 rounded text-ink-300 hover:text-paper-100 hover:bg-ink-700 disabled:opacity-30 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-ink-300">
              {currentPage} / {pageCount}
            </span>
            <button onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= pageCount}
              className="p-1 rounded text-ink-300 hover:text-paper-100 hover:bg-ink-700 disabled:opacity-30 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div className="text-xs text-ink-500">
          {ocrResult && `${ocrResult.blocks.length}ブロック検出`}
        </div>
      </div>

      {/* Image area */}
      <div ref={containerRef} className="flex-1 overflow-auto flex items-start justify-center p-6">
        <div
          className="relative shadow-2xl"
          style={{ transform: `scale(${scale})`, transformOrigin: "top center", transition: "transform 0.2s" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="document"
            className="max-w-full block"
            onLoad={(e) => {
              const img = e.currentTarget;
              setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
              setImgRenderedSize({ w: img.offsetWidth, h: img.offsetHeight });
            }}
            style={{ maxWidth: "100%", display: "block" }}
          />

          {/* BBox overlays */}
          {ocrResult && imgNaturalSize.w > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {ocrResult.blocks.map((block, i) => {
                const x = block.bbox.x0 * scaleX;
                const y = block.bbox.y0 * scaleY;
                const w = (block.bbox.x1 - block.bbox.x0) * scaleX;
                const h = (block.bbox.y1 - block.bbox.y0) * scaleY;
                const isHighlighted = highlightedBlock === i;

                return (
                  <div
                    key={i}
                    onClick={() => onBlockClick?.(i)}
                    className="absolute border-2 rounded transition-all duration-200 pointer-events-auto cursor-pointer"
                    style={{
                      left: x, top: y, width: w, height: h,
                      borderColor: isHighlighted ? "#c0392b" : "rgba(26,82,118,0.4)",
                      backgroundColor: isHighlighted ? "rgba(192,57,43,0.15)" : "rgba(26,82,118,0.05)",
                    }}
                    title={`ブロック ${i + 1}: ${block.text.slice(0, 30)}...`}
                  >
                    {isHighlighted && (
                      <span className="absolute -top-5 left-0 text-[10px] bg-accent-red text-white px-1 rounded whitespace-nowrap">
                        #{i + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
