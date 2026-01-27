"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

interface Participant {
    email: string;
    fullName: string;
    role: string;
}

export default function DocumentUploadForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");

    // Default Participants: 1 Tenant, 1 Landlord
    const [participants, setParticipants] = useState<Participant[]>([
        { email: "", fullName: "", role: "TENANT" },
        { email: "", fullName: "", role: "LANDLORD" }
    ]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const updateParticipant = (index: number, field: keyof Participant, value: string) => {
        const newParts = [...participants];
        newParts[index] = { ...newParts[index], [field]: value };
        setParticipants(newParts);
    };

    const removeParticipant = (index: number) => {
        setParticipants(participants.filter((_, i) => i !== index));
    };

    const addParticipant = () => {
        setParticipants([...participants, { email: "", fullName: "", role: "WITNESS" }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) {
            toast.error("Please provide a title and a file.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("participants", JSON.stringify(participants));

        try {
            const res = await fetch("/api/dss/documents", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            toast.success("Document created & hashed successfully!");
            // Redirect to the "Signing Room" or List (We will build this next)
            // router.push(`/property-manager/dss/${data.data.id}`);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload New Contract
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g. Lease Agreement - Unit 101"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* File Drop Area (Simple) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-dashed border-gray-300 rounded-md bg-gray-50"
                        required
                    />
                </div>

                {/* Participants List */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Signers (Ordered)</label>
                        <button type="button" onClick={addParticipant} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <Plus size={14} /> Add Signer
                        </button>
                    </div>

                    <div className="space-y-3">
                        {participants.map((p, index) => (
                            <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-md border">
                                <span className="mt-2 text-xs font-bold text-gray-400 w-4">{index + 1}.</span>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                                    <input
                                        placeholder="Full Name"
                                        className="p-2 text-sm border rounded"
                                        value={p.fullName}
                                        onChange={(e) => updateParticipant(index, "fullName", e.target.value)}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="p-2 text-sm border rounded"
                                        value={p.email}
                                        onChange={(e) => updateParticipant(index, "email", e.target.value)}
                                        required
                                    />
                                    <select
                                        className="p-2 text-sm border rounded bg-white"
                                        value={p.role}
                                        onChange={(e) => updateParticipant(index, "role", e.target.value)}
                                    >
                                        <option value="TENANT">Tenant</option>
                                        <option value="LANDLORD">Landlord</option>
                                        <option value="WITNESS">Witness</option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeParticipant(index)}
                                    className="mt-2 text-red-400 hover:text-red-600"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Create & Hash Document"}
                </button>
            </form>
        </div>
    );
}
