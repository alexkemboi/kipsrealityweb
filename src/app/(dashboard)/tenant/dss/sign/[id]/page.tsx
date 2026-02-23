"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, PenTool, CheckCircle, Clock } from "lucide-react";

// Dynamically import PDF Viewer to avoid SSR issues
const PdfViewer = dynamic(() => import("@/components/dss/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-lg border bg-gray-50 flex items-center justify-center text-gray-500">
      Loading document preview...
    </div>
  ),
});

type ParticipantStatus = "PENDING" | "SIGNED" | string;

interface Participant {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  status: ParticipantStatus;
}

interface SigningDocument {
  id: string;
  title: string;
  status: string;
  currentStep?: number | null;
  originalFileUrl?: string | null;
  participants: Participant[];
}

interface SigningRoomResponse {
  document: SigningDocument;
  canSign: boolean;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function SigningRoomPage() {
  const params = useParams();

  const rawId = (params as Record<string, string | string[] | undefined>)?.id;
  const documentId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [docData, setDocData] = useState<SigningRoomResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  const fetchDocument = useCallback(async (signal?: AbortSignal) => {
    if (!documentId) {
      setDocData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/dss/documents/${documentId}`, {
        cache: "no-store",
        signal,
      });

      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        // keep data as null if response is not JSON
      }

      if (!res.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Failed to load document";
        throw new Error(message);
      }

      const payload = data as Partial<SigningRoomResponse>;
      if (!payload?.document) throw new Error("Invalid document response");

      setDocData({
        canSign: Boolean(payload.canSign),
        document: {
          ...payload.document,
          participants: Array.isArray(payload.document.participants)
            ? payload.document.participants
            : [],
        } as SigningDocument,
      });
    } catch (error) {
      // Ignore abort errors
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      toast.error(getErrorMessage(error, "Failed to load document"));
      setDocData(null);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDocument(controller.signal);
    return () => controller.abort();
  }, [fetchDocument]);

  const handleSign = async () => {
    if (!documentId) {
      toast.error("Document ID is missing");
      return;
    }

    if (signing) return;

    setSigning(true);
    try {
      const res = await fetch("/api/dss/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          signatureData: "Signed via RentFlow360 Web UI (Timestamped)",
        }),
      });

      let result: unknown = null;
      try {
        result = await res.json();
      } catch {
        // response may not be JSON
      }

      if (!res.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof (result as { error?: unknown }).error === "string"
            ? (result as { error: string }).error
            : "Failed to sign document";
        throw new Error(message);
      }

      toast.success("Signed successfully!");

      // Optimistic UI update (safe minimal update)
      setDocData((prev) =>
        prev
          ? {
              ...prev,
              canSign: false,
              document: {
                ...prev.document,
                status:
                  prev.document.status?.toUpperCase() === "COMPLETED"
                    ? prev.document.status
                    : prev.document.status,
                participants: Array.isArray(prev.document.participants)
                  ? [...prev.document.participants]
                  : [],
              },
            }
          : prev
      );

      // Re-fetch to reflect true backend state (no full page reload)
      await fetchDocument();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to sign document"));
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!documentId) {
    return <div className="p-10 text-center">Document ID is missing</div>;
  }

  if (!docData) {
    return <div className="p-10 text-center">Document not found</div>;
  }

  const { document, canSign } = docData;
  const participants = Array.isArray(document.participants) ? document.participants : [];
  const docStatus = (document.status || "").toUpperCase();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-xl border bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                docStatus === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {docStatus || "UNKNOWN"}
            </span>
            <span className="text-sm text-gray-500">
              • Step {document.currentStep ?? "-"}
            </span>
          </div>
        </div>

        {/* Dynamic Action Button */}
        {canSign ? (
          <Button
            type="button"
            onClick={handleSign}
            disabled={signing}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 md:w-auto"
          >
            {signing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <PenTool className="mr-2 h-5 w-5" />
            )}
            Sign Now
          </Button>
        ) : (
          <Button disabled variant="outline" size="lg" className="w-full md:w-auto">
            {docStatus === "COMPLETED" ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Document Completed
              </>
            ) : (
              <>
                <Clock className="mr-2 h-5 w-5" />
                Waiting for others
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content: PDF */}
        <div className="lg:col-span-2">
          {document.originalFileUrl ? (
            <PdfViewer url={document.originalFileUrl} />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              No document file available
            </div>
          )}
        </div>

        {/* Sidebar: Participants List */}
        <div className="h-fit rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Signers</h3>
          <div className="space-y-4">
            {participants.length === 0 ? (
              <p className="text-sm text-gray-500">No participants found.</p>
            ) : (
              participants.map((p, idx) => {
                const signed = (p.status || "").toUpperCase() === "SIGNED";
                const key = p.id || p.email || `${idx}`;

                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          signed
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {p.name || p.email || "Participant"}
                        </p>
                        <p className="text-xs uppercase text-gray-500">
                          {p.role || "Signer"}
                        </p>
                      </div>
                    </div>
                    {signed && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
