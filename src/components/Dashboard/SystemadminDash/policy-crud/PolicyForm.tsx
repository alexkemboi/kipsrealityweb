"use client";
import { useState } from "react";
import { Policy } from "./PolicyList";

interface Props {
  policy?: Policy | null;
  onSaved: () => void;
  onClose: () => void;
}

export default function PolicyForm({ policy, onSaved, onClose }: Props) {
  const [form, setForm] = useState({
    title: policy?.title || "",
    companyName: policy?.companyName || "",
    contactEmail: policy?.contactEmail || "",
    privacyEmail: policy?.privacyEmail || "",
    website: policy?.website || "",
    mailingAddress: policy?.mailingAddress || "",
    responseTime: policy?.responseTime || "",
    inactiveAccountThreshold: policy?.inactiveAccountThreshold || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const method = policy ? "PUT" : "POST";
    const url = policy ? `/api/policies/${policy.id}` : `/api/policies`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSaved();
    onClose();
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold">
        {policy ? "Edit Policy" : "New Policy"}
      </h2>

      {Object.keys(form).map((key) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-1 capitalize">
            {key}
          </label>
          <input
            name={key}
            value={(form as any)[key]}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
      ))}

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1 border rounded">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          {policy ? "Save Changes" : "Create"}
        </button>
      </div>
    </div>
  );
}
