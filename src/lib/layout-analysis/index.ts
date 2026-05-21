import type { BBox, OCRBlock, OCRLine, OCRResult, OCRSettings, OCRWord, TextDirection } from "@/types";

// ── 1. Row clustering ────────────────────────────────────────────────────────
function clusterLinesIntoRows(lines: OCRLine[], isVertical: boolean): OCRLine[][] {
  if (lines.length === 0) return [];

  const sorted = [...lines].sort((a, b) =>
    isVertical ? a.bbox.x0 - b.bbox.x0 : a.bbox.y0 - b.bbox.y0
  );

  const rows: OCRLine[][] = [[sorted[0]]];

  for (let i = 1; i < sorted.length; i++) {
    const line = sorted[i];
    const lastRow = rows[rows.length - 1];
    const lastLine = lastRow[lastRow.length - 1];

    const threshold = isVertical
      ? (lastLine.bbox.x1 - lastLine.bbox.x0) * 0.6
      : (lastLine.bbox.y1 - lastLine.bbox.y0) * 0.6;

    const gap = isVertical
      ? line.bbox.x0 - lastLine.bbox.x1
      : line.bbox.y0 - lastLine.bbox.y1;

    if (gap < threshold) {
      lastRow.push(line);
    } else {
      rows.push([line]);
    }
  }

  return rows;
}

// ── 2. Column estimation ──────────────────────────────────────────────────────
function estimateColumns(
  lines: OCRLine[],
  pageWidth: number,
  requestedColumns: number | "auto"
): number {
  if (requestedColumns !== "auto") return requestedColumns as number;

  // Build x-position histogram
  const buckets = 10;
  const hist = new Array(buckets).fill(0);
  for (const line of lines) {
    const cx = (line.bbox.x0 + line.bbox.x1) / 2;
    const bucket = Math.min(buckets - 1, Math.floor((cx / pageWidth) * buckets));
    hist[bucket]++;
  }

  // Count valleys (gaps between clusters)
  let valleys = 0;
  for (let i = 1; i < buckets - 1; i++) {
    if (hist[i] < hist[i - 1] * 0.3 && hist[i] < hist[i + 1] * 0.3) valleys++;
  }

  return Math.min(3, valleys + 1);
}

// ── 3. Assign columns ─────────────────────────────────────────────────────────
function assignColumns(
  lines: OCRLine[],
  pageWidth: number,
  numColumns: number,
  isVertical: boolean
): Array<OCRLine & { column: number }> {
  if (isVertical) {
    // For vertical text, columns run right→left
    const colWidth = pageWidth / numColumns;
    return lines.map((line) => {
      const cx = (line.bbox.x0 + line.bbox.x1) / 2;
      // rightmost = column 0
      const col = numColumns - 1 - Math.min(numColumns - 1, Math.floor(cx / colWidth));
      return { ...line, column: col };
    });
  } else {
    const colWidth = pageWidth / numColumns;
    return lines.map((line) => {
      const cx = (line.bbox.x0 + line.bbox.x1) / 2;
      const col = Math.min(numColumns - 1, Math.floor(cx / colWidth));
      return { ...line, column: col };
    });
  }
}

// ── 4. Sort into read order ───────────────────────────────────────────────────
function sortByReadOrder(
  lines: Array<OCRLine & { column: number }>,
  direction: TextDirection
): Array<OCRLine & { column: number }> {
  const isVertical = direction === "vertical-td" || direction === "vertical-rl";
  const isRTL = direction === "horizontal-rl" || direction === "vertical-rl";

  return [...lines].sort((a, b) => {
    // Primary: column order
    if (a.column !== b.column) {
      return isRTL && !isVertical
        ? b.column - a.column  // RTL horizontal: right col first
        : a.column - b.column; // LTR / vertical: left col first (col 0 = rightmost for vertical)
    }

    // Secondary: position within column
    if (isVertical) {
      return a.bbox.y0 - b.bbox.y0; // top to bottom
    }
    return a.bbox.y0 - b.bbox.y0; // top to bottom for horizontal too
  });
}

// ── 5. Group sorted lines into blocks ─────────────────────────────────────────
function groupIntoBlocks(
  sortedLines: Array<OCRLine & { column: number }>
): OCRBlock[] {
  const blocks: OCRBlock[] = [];
  let current: Array<OCRLine & { column: number }> = [];

  for (let i = 0; i < sortedLines.length; i++) {
    const line = sortedLines[i];
    if (current.length === 0) {
      current.push(line);
      continue;
    }

    const prev = current[current.length - 1];
    const sameColumn = prev.column === line.column;
    const lineHeight = prev.bbox.y1 - prev.bbox.y0;
    const gap = line.bbox.y0 - prev.bbox.y1;
    const bigGap = gap > lineHeight * 1.5;

    if (sameColumn && !bigGap) {
      current.push(line);
    } else {
      blocks.push(buildBlock(current, blocks.length));
      current = [line];
    }
  }

  if (current.length > 0) blocks.push(buildBlock(current, blocks.length));
  return blocks;
}

function buildBlock(lines: Array<OCRLine & { column: number }>, order: number): OCRBlock {
  const x0 = Math.min(...lines.map((l) => l.bbox.x0));
  const y0 = Math.min(...lines.map((l) => l.bbox.y0));
  const x1 = Math.max(...lines.map((l) => l.bbox.x1));
  const y1 = Math.max(...lines.map((l) => l.bbox.y1));
  const text = lines.map((l) => l.text.trim()).filter(Boolean).join("\n");
  const confidence = lines.reduce((s, l) => s + l.confidence, 0) / lines.length;

  return {
    text,
    bbox: { x0, y0, x1, y1 },
    lines,
    column: lines[0].column,
    readOrder: order,
  };
}

// ── 6. Ruby removal ───────────────────────────────────────────────────────────
function removeRuby(text: string): string {
  // Remove small kana sequences that likely represent furigana
  return text
    .replace(/[\u3041-\u3096]{1,4}(?=[\u4e00-\u9fff])/g, "")
    .replace(/(?<=[\u4e00-\u9fff])[\u3041-\u3096]{1,4}/g, "");
}

// ── 7. Direction detection ────────────────────────────────────────────────────
export function detectDirection(lines: OCRLine[], pageWidth: number, pageHeight: number): TextDirection {
  if (lines.length === 0) return "horizontal-lr";

  // Check aspect ratios of bounding boxes
  let tallCount = 0;
  let wideCount = 0;

  for (const line of lines) {
    const w = line.bbox.x1 - line.bbox.x0;
    const h = line.bbox.y1 - line.bbox.y0;
    if (h > w * 1.5) tallCount++;
    else if (w > h * 1.5) wideCount++;
  }

  if (tallCount > wideCount * 1.5) return "vertical-rl";
  return "horizontal-lr";
}

// ── Main export ───────────────────────────────────────────────────────────────
export function analyzeLayout(
  rawLines: OCRLine[],
  pageWidth: number,
  pageHeight: number,
  settings: OCRSettings
): OCRResult {
  const start = Date.now();

  // Resolve direction
  let direction = settings.direction;
  if (direction === "auto" || settings.autoDetect) {
    direction = detectDirection(rawLines, pageWidth, pageHeight);
  }

  const isVertical = direction === "vertical-td" || direction === "vertical-rl";

  // Column estimation
  const numColumns = estimateColumns(rawLines, pageWidth, settings.columns);

  // Assign columns
  const linesWithColumns = assignColumns(rawLines, pageWidth, numColumns, isVertical);

  // Sort by read order
  const sorted = sortByReadOrder(linesWithColumns, direction);

  // Group into blocks
  const blocks = groupIntoBlocks(sorted);

  // Build full text
  let fullText = blocks.map((b) => b.text).join("\n\n");

  // Post-processing
  if (settings.removeRuby) fullText = removeRuby(fullText);

  // Format output
  if (settings.outputFormat === "markdown") {
    fullText = blocks.map((b, i) => `## ブロック ${i + 1}\n\n${b.text}`).join("\n\n---\n\n");
  } else if (settings.outputFormat === "json") {
    fullText = JSON.stringify(
      blocks.map((b) => ({
        order: b.readOrder,
        column: b.column,
        text: b.text,
        bbox: b.bbox,
      })),
      null,
      2
    );
  }

  const avgConfidence =
    blocks.length > 0
      ? blocks.reduce((s, b) => s + (b.lines[0]?.confidence ?? 0), 0) / blocks.length
      : 0;

  return {
    blocks,
    fullText,
    confidence: avgConfidence,
    pageWidth,
    pageHeight,
    detectedDirection: direction,
    detectedColumns: numColumns,
    processingTime: Date.now() - start,
  };
}
