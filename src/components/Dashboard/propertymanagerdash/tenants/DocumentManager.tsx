// components/lease/DocumentManager.tsx
"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface LeaseDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  version: number;
  uploadedAt: string;
  isSigned: boolean;
  signedAt: string | null;
  description: string;
}

interface DocumentManagerProps {
  leaseId: string;
}

export default function DocumentManager({ leaseId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    documentType: "LEASE_AGREEMENT",
    description: "",
  });

  useEffect(() => {
    fetchDocuments();
  }, [leaseId]);

  async function fetchDocuments() {
    try {
      const res = await fetch(`/api/lease/${leaseId}/documents`);
      const data = await res.json();
      if (res.ok) {
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!uploadForm.file) {
      alert("Please select a file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("documentType", uploadForm.documentType);
      formData.append("description", uploadForm.description);

      const res = await fetch(`/api/lease/${leaseId}/document`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Document uploaded successfully");
        setDocuments([...documents, data]);
        setShowUploadForm(false);
        setUploadForm({
          file: null,
          documentType: "LEASE_AGREEMENT",
          description: "",
        });
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/lease/${leaseId}/document/${docId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== docId));
        alert("Document deleted");
      } else {
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred");
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "LEASE_AGREEMENT":
        return "bg-blue-100 text-blue-800";
      case "ADDENDUM":
        return "bg-purple-100 text-purple-800";
      case "AMENDMENT":
        return "bg-orange-100 text-orange-800";
      case "RENEWAL_NOTICE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Documents
        </h2>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">Upload New Document</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={uploadForm.documentType}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, documentType: e.target.value })
                }
              >
                <option value="LEASE_AGREEMENT">Lease Agreement</option>
                <option value="ADDENDUM">Addendum</option>
                <option value="AMENDMENT">Amendment</option>
                <option value="RENEWAL_NOTICE">Renewal Notice</option>
                <option value="TERMINATION_NOTICE">Termination Notice</option>
                <option value="INSPECTION_REPORT">Inspection Report</option>
                <option value="PROOF_OF_INSURANCE">Proof of Insurance</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File
              </label>
              <input
                type="file"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    file: e.target.files?.[0] || null,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Brief description..."
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, description: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadForm.file}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  uploading || !uploadForm.file
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">{doc.fileName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getDocumentTypeColor(
                            doc.documentType
                          )}`}
                        >
                          {doc.documentType.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-500">
                          v{doc.version}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(doc.fileSize)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {doc.description && (
                    <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    {doc.isSigned ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Signed {doc.signedAt && `on ${new Date(doc.signedAt).toLocaleDateString()}`}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <AlertCircle className="w-3 h-3" />
                        Unsigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <a
                    href={doc.fileUrl}
                    download
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {documents.length}
            </p>
            <p className="text-xs text-gray-500">Total Documents</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {documents.filter((d) => d.isSigned).length}
            </p>
            <p className="text-xs text-gray-500">Signed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-400">
              {documents.filter((d) => !d.isSigned).length}
            </p>
            <p className="text-xs text-gray-500">Unsigned</p>
          </div>
        </div>
      </div>
    </div>
  );
}