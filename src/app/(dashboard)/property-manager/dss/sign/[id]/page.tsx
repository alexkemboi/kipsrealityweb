"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, PenTool } from "lucide-react";

// Dynamically import PDF Viewer to avoid SSR DOM APIs (e.g., DOMMatrix) errors
const PdfViewer = dynamic(() => import("@/components/dss/PdfViewer"), {
  ssr: false,
});

type DssDocument = {
  id: string;
  title?: string | null;
  status?: string | null;
  originalFileUrl?: string | null;
};

type DocumentResponse = {
  document?: DssDocument | null;
  canSign?: boolean;
  error?: string;
};

export default function SigningRoomPage() {
  const params = useParams();
  const router = useRouter();

  const documentId = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]) as string | undefined;

  const [document, setDocument] = useState<DssDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [canSign, setCanSign] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function fetchDoc() {
      if (!documentId) {
        if (isActive) {
          toast.error("Invalid document ID");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`/api/dss/documents/${documentId}`, {
          cache: "no-store",
        });

        const data = (await res.json().catch(() => ({}))) as DocumentResponse;

        if (!res.ok) {
          throw new Error(data.error || "Failed to load document");
        }

        if (!isActive) return;

        setDocument(data.document ?? null);
        setCanSign(Boolean(data.canSign));
      } catch (error: unknown) {
        console.error("[SigningRoomPage] fetchDoc error:", error);
        if (isActive) {
          toast.error(error instanceof Error ? error.message : "Failed to load document");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void fetchDoc();

    return () => {
      isActive = false;
    };
  }, [documentId]);

  const handleSign = async () => {
    if (!documentId) {
      toast.error("Invalid document ID");
      return;
    }

    setSigning(true);

    try {
      const res = await fetch("/api/dss/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          signatureData: "Signed by Property Manager via Web UI",
        }),
      });

      const result = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(result.error || "Signing failed");
      }

      toast.success("Document signed successfully!");
      setCanSign(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Signing failed");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!document) {
    return <div className="p-10 text-center">Document not found</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{document.title ?? "Untitled Document"}</h1>
          <p className="text-gray-500">
            Status:{" "}
            <span className="font-semibold text-blue-600">
              {document.status ?? "UNKNOWN"}
            </span>
          </p>
        </div>

        {canSign ? (
          <Button
            onClick={handleSign}
            disabled={signing}
            className="bg-green-600 hover:bg-green-700"
          >
            {signing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <PenTool className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Sign Document
          </Button>
        ) : (
          <Button disabled variant="secondary">
            {document.status === "COMPLETED"
              ? "Signing Completed"
              : "Waiting for others..."}
          </Button>
        )}
      </div>

      {document.originalFileUrl ? (
        <PdfViewer url={document.originalFileUrl} />
      ) : (
        <div className="flex h-96 items-center justify-center rounded bg-gray-100 text-gray-500">
          File URL not found.
        </div>
      )}
    </div>
  );
}
