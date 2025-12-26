"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Upload, Trash2, FileCheck } from "lucide-react";
import { LeaseDocumentType } from "@prisma/client";

interface Lease {
  id: string;
  propertyName: string;
  rentAmount: number;
  paymentDueDay: number;
  startDate: string;
  endDate: string;
  leaseStatus: string;
  documentVersion: number;
}

interface LeaseDocument {
  id: string;
  leaseId: string;
  documentType: LeaseDocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  description?: string;
  createdAt: string;
}

interface LeaseAmendment {
  id: string;
  leaseId: string;
  amendmentType: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED";
  createdAt: string;
  effectiveDate: string;
}

export default function TenantLeasePage() {
  const params = useParams();
  
  // Get leaseId directly from params - it's already resolved in client components
  const leaseId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;

  const [lease, setLease] = useState<Lease | null>(null);
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [amendments, setAmendments] = useState<LeaseAmendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<LeaseDocumentType>("OTHER");
  const [description, setDescription] = useState("");

  // Fetch all lease-related data
  useEffect(() => {
    console.log("LeaseId from params:", leaseId);
    
    if (!leaseId) {
      setError("No lease ID provided");
      setLoading(false);
      return;
    }
    
    fetchData();
  }, [leaseId]);

  async function fetchData() {
    if (!leaseId) return;
    
    console.log("Fetching data for lease:", leaseId);
    setLoading(true);
    setError(null);
    
    try {
      // Fetch lease data
      const leaseRes = await fetch(`/api/lease/${leaseId}`);
      if (!leaseRes.ok) {
        const errorData = await leaseRes.json().catch(() => ({ error: "Failed to fetch lease" }));
        throw new Error(errorData.error || `Failed to fetch lease: ${leaseRes.status}`);
      }
      const leaseDataRaw = await leaseRes.json();

      // Map API response to Lease interface
      const leaseData: Lease = {
        id: leaseDataRaw.id,
        propertyName: leaseDataRaw.property?.name || "Unknown Property",
        rentAmount: leaseDataRaw.rentAmount,
        paymentDueDay: leaseDataRaw.paymentDueDay,
        startDate: leaseDataRaw.startDate,
        endDate: leaseDataRaw.endDate,
        leaseStatus: leaseDataRaw.leaseStatus,
        documentVersion: leaseDataRaw.documentVersion ?? 0,
      };

      setLease(leaseData);

      // Fetch documents - don't fail if this errors
      try {
        const docRes = await fetch(`/api/lease/${leaseId}/document`);
        if (docRes.ok) {
          const docData: LeaseDocument[] = await docRes.json();
          setDocuments(docData);
        } else {
          console.warn("Failed to fetch documents, continuing anyway");
          setDocuments([]);
        }
      } catch (docErr) {
        console.warn("Document fetch error:", docErr);
        setDocuments([]);
      }

      // Fetch amendments - don't fail if this errors
      try {
        const amendRes = await fetch(`/api/lease/${leaseId}/ammendment`);
        if (amendRes.ok) {
          const amendData: LeaseAmendment[] = await amendRes.json();
          setAmendments(amendData);
        } else {
          console.warn("Failed to fetch amendments, continuing anyway");
          setAmendments([]);
        }
      } catch (amendErr) {
        console.warn("Amendment fetch error:", amendErr);
        setAmendments([]);
      }

    } catch (err) {
      console.error("Fetch tenant lease data error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch lease data");
    } finally {
      setLoading(false);
    }
  }

  // Upload document
  async function uploadDocument() {
    if (!file || !leaseId) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      formData.append("description", description);

      const res = await fetch(`/api/lease/${leaseId}/document`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errData.error || "Upload failed");
      }

      const newDoc: LeaseDocument = await res.json();
      setDocuments([newDoc, ...documents]);
      setFile(null);
      setDescription("");
      setDocumentType("OTHER");
      alert("Document uploaded successfully!");
    } catch (err) {
      console.error("Document upload error:", err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // Sign amendment
  async function signAmendment(amendmentId: string) {
    if (!leaseId) return;
    try {
      const res = await fetch(`/api/lease/${leaseId}/amendment/${amendmentId}/sign`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to sign amendment");
      alert("Amendment signed successfully!");
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Sign amendment error:", err);
      alert(err instanceof Error ? err.message : "Failed to sign amendment");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lease details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl">⚠</span>
          </div>
          <p className="text-xl font-semibold text-red-600 mb-2">Error Loading Lease</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-xl text-red-600">Lease not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Lease Details */}
      <div className="bg-white p-6 rounded-xl shadow space-y-2">
        <h2 className="text-xl font-semibold">{lease.propertyName} Lease</h2>
        <p>Rent Amount: ${lease.rentAmount.toLocaleString()}</p>
        <p>Payment Due Day: {lease.paymentDueDay}</p>
        <p>Start Date: {new Date(lease.startDate).toLocaleDateString()}</p>
        <p>End Date: {new Date(lease.endDate).toLocaleDateString()}</p>
        <p>Status: <span className="font-semibold">{lease.leaseStatus}</span></p>
        <p>Document Version: {lease.documentVersion}</p>
      </div>

      {/* Upload Documents */}
      <div className="bg-white p-6 rounded-xl shadow space-y-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Upload Document
        </h3>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          className="block w-full border border-gray-300 rounded px-3 py-2"
        />
        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as LeaseDocumentType)}
        >
          {Object.keys(LeaseDocumentType).map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Description (optional)"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <button
          onClick={uploadDocument}
          disabled={!file || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

      {/* Documents List */}
      <div className="bg-white p-6 rounded-xl shadow space-y-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> Lease Documents ({documents.length})
        </h3>
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center border border-gray-200 rounded p-3 hover:bg-gray-50">
                <div>
                  <p className="font-medium">{doc.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {doc.documentType.replace(/_/g, " ")} &middot; {(doc.fileSize / 1024).toFixed(2)} KB &middot; Uploaded on{" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                  {doc.description && <p className="text-sm text-gray-600 mt-1">{doc.description}</p>}
                </div>
                <a 
                  href={doc.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Amendments */}
      <div className="bg-white p-6 rounded-xl shadow space-y-3">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" /> Amendments ({amendments.length})
        </h3>
        {amendments.length === 0 ? (
          <p className="text-gray-500">No amendments proposed yet.</p>
        ) : (
          <div className="space-y-2">
            {amendments.map((amend) => (
              <div key={amend.id} className="flex justify-between items-center border border-gray-200 rounded p-3 hover:bg-gray-50">
                <div>
                  <p className="font-medium">{amend.description || amend.amendmentType.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-500">
                    Status: <span className="font-semibold">{amend.status}</span> &middot; Effective: {new Date(amend.effectiveDate).toLocaleDateString()}
                  </p>
                </div>
                {amend.status === "PENDING" && (
                  <button
                    onClick={() => signAmendment(amend.id)}
                    className="px-3 py-1 bg-navy-700 text-white rounded hover:bg-navy-800 text-sm font-medium"
                  >
                    Sign Amendment
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
