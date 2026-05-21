// OCR Settings
export type TextDirection =
  | "horizontal-lr"
  | "horizontal-rl"
  | "vertical-td"
  | "vertical-rl"
  | "auto";

export type ColumnLayout = 1 | 2 | 3 | "auto";

export type OCREngine = "tesseract" | "google-vision" | "azure";

export type OCRPrecision = "fast" | "balanced" | "accurate";

export type OutputFormat = "plain" | "markdown" | "json";

export interface OCRSettings {
  language: string;
  direction: TextDirection;
  columns: ColumnLayout;
  autoDetect: boolean;
  precision: OCRPrecision;
  engine: OCREngine;
  removeRuby: boolean;
  excludeHeaderFooter: boolean;
  outputFormat: OutputFormat;
}

// OCR Result types
export interface BBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface OCRWord {
  text: string;
  bbox: BBox;
  confidence: number;
}

export interface OCRLine {
  text: string;
  bbox: BBox;
  words: OCRWord[];
  confidence: number;
}

export interface OCRBlock {
  text: string;
  bbox: BBox;
  lines: OCRLine[];
  column: number;
  readOrder: number;
}

export interface OCRResult {
  blocks: OCRBlock[];
  fullText: string;
  confidence: number;
  pageWidth: number;
  pageHeight: number;
  detectedDirection?: TextDirection;
  detectedColumns?: number;
  processingTime: number;
}

export interface HighlightedRegion {
  bbox: BBox;
  blockIndex: number;
  text: string;
}

// File types
export type FileType = "pdf" | "image";

export interface UploadedFile {
  file: File;
  type: FileType;
  pageCount?: number;
  currentPage: number;
  imageDataUrl: string;
}

export interface ProcessingState {
  status: "idle" | "loading" | "processing" | "done" | "error";
  progress: number;
  message: string;
  error?: string;
}
