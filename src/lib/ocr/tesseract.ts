import { createWorker } from "tesseract.js";
import type { OCRLine, OCRSettings, OCRWord, BBox } from "@/types";
import { analyzeLayout } from "@/lib/layout-analysis";

const LANG_MAP: Record<string, string> = {
  jpn: "jpn",
  jpn_vert: "jpn_vert",
  eng: "eng",
  chi_sim: "chi_sim",
  chi_tra: "chi_tra",
  kor: "kor",
};

export async function runTesseractOCR(
  imageData: string,
  settings: OCRSettings,
  onProgress?: (progress: number, message: string) => void
) {
  const lang = LANG_MAP[settings.language] ?? "jpn";

  onProgress?.(5, "OCRエンジンを初期化中...");

  const worker = await createWorker(lang, 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress?.(10 + Math.round(m.progress * 70), `OCR処理中... ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  onProgress?.(80, "テキストを解析中...");

  const { data } = await worker.recognize(imageData);
  await worker.terminate();

  onProgress?.(85, "レイアウトを解析中...");

  // Map Tesseract result to our types
  const lines: OCRLine[] = [];

  for (const block of data.blocks ?? []) {
    for (const para of block.paragraphs ?? []) {
      for (const line of para.lines ?? []) {
        const words: OCRWord[] = (line.words ?? []).map((w) => ({
          text: w.text,
          confidence: w.confidence,
          bbox: normalizeBBox(w.bbox),
        }));

        if (words.length === 0) continue;

        lines.push({
          text: line.text.trim(),
          bbox: normalizeBBox(line.bbox),
          words,
          confidence: line.confidence,
        });
      }
    }
  }

  const pageWidth = data.blocks?.[0]
    ? Math.max(...data.blocks.map((b) => b.bbox.x1))
    : 800;
  const pageHeight = data.blocks?.[0]
    ? Math.max(...data.blocks.map((b) => b.bbox.y1))
    : 1000;

  onProgress?.(95, "読み順を整理中...");

  const result = analyzeLayout(lines, pageWidth, pageHeight, settings);

  onProgress?.(100, "完了！");

  return result;
}

function normalizeBBox(bbox: { x0: number; y0: number; x1: number; y1: number }): BBox {
  return { x0: bbox.x0, y0: bbox.y0, x1: bbox.x1, y1: bbox.y1 };
}
