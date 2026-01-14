"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// 1. Configure the Worker (Critical for Next.js)
// We use a CDN to load the worker script to avoid build errors.
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center bg-gray-100 rounded-lg p-4 border border-gray-300 min-h-[500px]">
      {/* 2. PDF Render Area */}
      <div className="relative shadow-lg mb-4 max-w-full overflow-auto">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10 h-[600px] w-full">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-500">Loading Contract...</span>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null} // We handle loading state manually above
          className="border"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={600} // Fixed width for consistency, or use responsive logic
            className="bg-white"
          />
        </Document>
      </div>

      {/* 3. Navigation Controls */}
      {numPages > 0 && (
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border">
          <button
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
            title="Previous page"
            className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-30"
          >
            <ChevronLeft />
          </button>

          <span className="text-sm font-medium">
            Page {pageNumber} of {numPages}
          </span>

          <button
            onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
            disabled={pageNumber >= numPages}
            aria-label="Next page"
            title="Next page"
            className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}