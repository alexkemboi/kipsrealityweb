"use client";

import { useEffect, useState } from "react";
import { FileText, Upload, Trash2 } from "lucide-react";
import { LeaseDocument_documentType } from "@prisma/client";
import { useParams } from "next/navigation";

interface LeaseDocument {
  id: string;
  leaseId: string;
  documentType: LeaseDocument_documentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  description?: string;
  createdAt: string;
}

export default function DocumentsManager() {
  const { id: leaseId } = useParams(); // get leaseId from route
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<LeaseDocument_documentType>("OTHER");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (leaseId) fetchDocuments();
  }, [leaseId]);

  async function fetchDocuments() {
    try {
      setLoading(true);
      const res = await fetch(`/api/lease/${leaseId}/document`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data: LeaseDocument[] = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error("Fetch documents error:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

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
        const errorData = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errorData.error);
      }

      const newDoc: LeaseDocument = await res.json();
      setDocuments([newDoc, ...documents]);
      setFile(null);
      setDescription("");
      setDocumentType("OTHER");
    } catch (err: any) {
      console.error("Document upload error:", err);
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(docId: string) {
    if (!leaseId || !confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/lease/${leaseId}/document/${docId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete document");
      setDocuments(documents.filter((d) => d.id !== docId));
    } catch (err) {
      console.error("Delete document error:", err);
      alert("Failed to delete document");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-600" />
        Lease Documents
      </h2>

      {/* Upload Form */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full" />
        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as LeaseDocument_documentType)}
        >
          {Object.keys(LeaseDocument_documentType).map((type) => (
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
        />
        <button
          onClick={uploadDocument}
          disabled={!file || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No documents uploaded yet</div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="border border-gray-200 rounded p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{doc.fileName}</p>
                <p className="text-xs text-gray-500">
                  {doc.documentType.replace(/_/g, " ")} &middot; {(doc.fileSize / 1024).toFixed(2)} KB &middot; Uploaded on{" "}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  View
                </a>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="text-red-600 hover:bg-red-50 p-1 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
