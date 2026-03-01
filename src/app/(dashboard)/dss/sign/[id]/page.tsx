"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle, CheckCircle, FileText, XCircle,
  UserCheck, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DocumentData {
  id: string;
  title: string;
  originalFileUrl?: string;
  status: string;
  participants: Array<{
    email: string;
    role: string;
    fullName?: string;
    hasSigned: boolean;
  }>;
  lease?: {
    id: string;
  };
}

type ApiDocResponse = {
  success?: boolean;
  document?: DocumentData;
  error?: string;
};

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// TODO: Replace with real auth context / token parsing.
// This must be the authenticated user email in production.
async function getUserEmail(): Promise<string> {
  return "user@example.com";
}

export default function SigningRoom() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const documentId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [hasReviewed, setHasReviewed] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [docData, setDocData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<string>("");
  const [beneficiaryName, setBeneficiaryName] = useState<string>("");

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      toast.error("Invalid document ID.");
      return;
    }

    const controller = new AbortController();

    async function fetchDocument() {
      setLoading(true);

      try {
        const res = await fetch(`/api/dss/documents/${documentId}`);
        if (!res.ok) throw new Error("Failed to load document");
        const data = await res.json();

        if (data.success) {
          setDocument(data.document);

          // Determine current user's role from participants
          const userEmail = await getUserEmail(); // This would come from auth context/token
          const participant = data.document.participants.find((p: { email: string; role: string }) => p.email === userEmail);
          if (participant) {
            setMyRole(participant.role);
            // For custodian, we need to know who they're signing for
            // In a real app, this might come from the participant metadata or separate API
            if (participant.role === "CUSTODIAN") {
              setBeneficiaryName("Elderly Tenant (John Doe)"); // Placeholder - should be dynamic
            }
          }
        }
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return;
        console.error("Error fetching document:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load document");
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }

    fetchDocument();

    return () => controller.abort();
  }, [documentId]);

  const hasFile = !!docData?.originalFileUrl;

  const canSign = useMemo(() => {
    if (!docData) return false;
    if (isSubmitting) return false;
    if (!hasReviewed) return false;
    // Optional future rule checks:
    // if (docData.status !== "PENDING_SIGNATURE") return false;
    return true;
  }, [docData, isSubmitting, hasReviewed]);

  // NOTE:
  // This only tracks scrolling of the OUTER container, not guaranteed PDF review inside iframe.
  // If the PDF viewer scrolls inside the iframe, true review enforcement requires a custom viewer (e.g., PDF.js).
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 16; // threshold
    if (reachedBottom && !hasReviewed) {
      setHasReviewed(true);
    }
  };

  const handleSign = async () => {
    if (!documentId || !docData) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/dss/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: documentId,
          signatureData: "Signed via RentFlow360 Web UI", // In real app, use canvas signature
          onBehalfOf: myRole === 'CUSTODIAN' ? beneficiaryName : null
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success("Document Signed Successfully");
      // Refresh page data
      router.refresh();
      setIsSignModalOpen(false);

      // If this page is client-fetched, router.refresh() may not refetch local state.
      // It can still refresh parent server components. Keep it, but also optimistically update local UI if needed.
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signing failed";
      toast.error(message);
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      toast.error("Please provide a reason");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/dss/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: documentId,
          reason: rejectReason
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success("Document Rejected");
      setIsRejectModalOpen(false);
      setRejectReason("");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rejection failed";
      toast.error(message);
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" aria-hidden="true" />
          <span>Loading document...</span>
        </div>
      </div>
    );
  }

  if (!documentId || !docData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" role="alert">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Document not found</h2>
          <p className="text-sm text-gray-500 mt-1">
            The signing link may be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{docData.title}</h1>

          {myRole === "CUSTODIAN" && (
            <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mt-1">
              <ShieldAlert size={16} aria-hidden="true" />
              <span>Acting as Custodian for: {beneficiaryName}</span>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {hasReviewed ? (
            <span className="flex items-center gap-2 text-green-600"><CheckCircle size={16} /> Reviewed</span>
          ) : (
            <span className="flex items-center gap-2"><FileText size={16} /> Scroll to end to review</span>
          )}
        </div>
      </header>

      {/* DOCUMENT VIEWER (The PDF) */}
      <div
        className="flex-1 overflow-y-auto p-8 flex justify-center"
        onScroll={handleScroll}
      >
        {document.originalFileUrl ? (
          <div className="bg-white shadow-lg w-full max-w-4xl min-h-[1000px] p-10 border">
            <iframe
              src={document.originalFileUrl}
              className="w-full h-full min-h-[800px]"
              title="Document Viewer"
            />
          </div>
        ) : (
          <div className="bg-white shadow-lg w-full max-w-4xl min-h-[600px] p-10 border rounded-md flex items-center justify-center">
            <p className="text-gray-500">No document file available.</p>
          </div>
        )}
      </div>

      {/* ACTION FOOTER */}
      <footer className="bg-white border-t px-6 py-4 flex justify-end gap-4 shadow-lg z-10">
        <Button
          variant="destructive"
          onClick={() => setIsRejectModalOpen(true)}
        >
          Decline / Reject
        </Button>

        <Button
          className="bg-blue-600 hover:bg-blue-700 px-8"
          disabled={!hasReviewed} // Forces user to scroll first
          onClick={() => setIsSignModalOpen(true)}
        >
          {myRole === 'CUSTODIAN' ? "Sign as Custodian" : "Sign Document"}
        </Button>
      </footer>

      {/* SIGN MODAL */}
      <Dialog
        open={isSignModalOpen}
        onOpenChange={(open) => {
          if (isSubmitting) return;
          setIsSignModalOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Signature</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              By clicking confirm, you agree to be legally bound by this document.
            </div>

            {myRole === 'CUSTODIAN' && (
              <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg border border-amber-100">
                <UserCheck className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Custodian Declaration</p>
                  <p className="text-amber-700 text-xs mt-1">
                    I certify that I am the authorized custodian for <strong>{beneficiaryName}</strong> and I am signing this document on their behalf in their best interest.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSignModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSign} disabled={isSubmitting}>
              {isSubmitting ? "Signing..." : "Confirm & Sign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT MODAL */}
      <Dialog
        open={isRejectModalOpen}
        onOpenChange={(open) => {
          if (isSubmitting) return;
          setIsRejectModalOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle size={20} /> Reject Document
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <label className="block text-sm font-medium mb-2">Reason for rejection:</label>
            <textarea
              className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              rows={3}
              placeholder="E.g., The rent amount is incorrect..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? "Rejecting..." : "Reject Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
