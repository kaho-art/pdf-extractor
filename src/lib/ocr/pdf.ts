"use client";

let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

export async function getPageCount(file: File): Promise<number> {
  const lib = await getPdfjs();
  const buf = await file.arrayBuffer();
  const doc = await lib.getDocument({ data: buf }).promise;
  return doc.numPages;
}

export async function renderPageToDataUrl(
  file: File,
  pageNum: number,
  scale = 2.0
): Promise<string> {
  const lib = await getPdfjs();
  const buf = await file.arrayBuffer();
  const doc = await lib.getDocument({ data: buf }).promise;
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvas.toDataURL("image/png");
}
