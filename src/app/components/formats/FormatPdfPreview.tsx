"use client";

import PdfPreview from "../workspace/PdfPreview";

export default function FormatPdfPreview({ latex }: { latex: string }) {
  return <PdfPreview latex={latex} />;
}
