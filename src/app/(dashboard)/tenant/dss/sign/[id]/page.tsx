"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic"; // 1. Dynamic Import for PDF to avoid SSR issues
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, PenTool, CheckCircle, Clock } from "lucide-react";

// Dynamically import PDF Viewer
const PdfViewer = dynamic(() => import("@/components/dss/PdfViewer"), { ssr: false });

export default function SigningRoomPage() {
  const params = useParams(); // Next.js 15: params might be a Promise in server components, but this is "use client"
  const router = useRouter();
  // Safe cast: In Client Components, params is unwrapped or accessible directly depending on version,
  // but to be safe for Next 15 types, treat as unknown then string.
  const documentId = params?.id as string;

  const [docData, setDocData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  // 2. Fetch Data
  useEffect(() => {
    if(!documentId) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/dss/documents/${documentId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to load");

        setDocData(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [documentId]);

  // 3. Handle Sign Action
  const handleSign = async () => {
    setSigning(true);
    try {
      const res = await fetch("/api/dss/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          signatureData: "Signed via RentFlow360 Web UI (Timestamped)", // In future, use a canvas signature pad here
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success("Signed successfully!");

      // Refresh page data to show updated status
      // We manually update local state to avoid full reload
      setDocData((prev: any) => ({
        ...prev,
        canSign: false, // Turn off button
        document: {
             ...prev.document,
             // Optimistically update the current user's status in list
             // (Optional, or just force reload window)
        }
      }));

      // Force reload to be safe
      window.location.reload();

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSigning(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  if (!docData) return <div className="p-10 text-center">Document not found</div>;

  const { document, canSign } = docData;

  return (
    <div className="container mx-auto py-8 max-w-5xl px-4">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                 document.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
             }`}>
                {document.status}
             </span>
             <span className="text-gray-500 text-sm">• Step {document.currentStep}</span>
          </div>
        </div>

        {/* Dynamic Action Button */}
        {canSign ? (
          <Button onClick={handleSign} disabled={signing} size="lg" className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
            {signing ? <Loader2 className="animate-spin mr-2" /> : <PenTool className="mr-2 w-5 h-5" />}
            Sign Now
          </Button>
        ) : (
          <Button disabled variant="outline" size="lg" className="w-full md:w-auto">
            {document.status === 'COMPLETED' ?
               <><CheckCircle className="mr-2 w-5 h-5 text-green-500"/> Document Completed</> :
               <><Clock className="mr-2 w-5 h-5"/> Waiting for others</>
            }
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content: PDF */}
        <div className="lg:col-span-2">
           {document.originalFileUrl ? (
             <PdfViewer url={document.originalFileUrl} />
           ) : (
             <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
               No document file available
             </div>
           )}
        </div>

        {/* Sidebar: Participants List */}
        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Signers</h3>
          <div className="space-y-4">
             {document.participants.map((p: any, idx: number) => (
               <div key={idx} className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        p.status === 'SIGNED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {idx + 1}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{p.name || p.email}</p>
                        <p className="text-xs text-gray-500 uppercase">{p.role}</p>
                    </div>
                 </div>
                 {p.status === 'SIGNED' && <CheckCircle className="w-4 h-4 text-green-500" />}
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}