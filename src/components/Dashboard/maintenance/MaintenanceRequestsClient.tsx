"use client";

import React, { useState } from "react";
import CreateRequestForm from "./CreateRequestForm";

type Request = any;

export default function MaintenanceRequestsClient({ initialRequests }: { initialRequests: Request[] }) {
  const [showForm, setShowForm] = useState(false);

  const requests = initialRequests || [];

  return (
    <div className="min-h-[400px] p-6 bg-[#0f172a]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Maintenance Requests</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow"
          >
            Make Request
          </button>
        </div>
      </div>

        {showForm && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-medium mb-3">Create a Request</h4>
            <CreateRequestForm />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {requests.length === 0 ? (
          <div className="p-6 text-black">No maintenance requests yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="sticky top-0 left-0 z-30 bg-white border-b px-4 py-3 text-left w-[220px]">Title</th>
                  <th className="sticky top-0 z-20 bg-white border-b px-4 py-3 text-left">Description</th>
                  <th className="sticky top-0 z-20 bg-white border-b px-4 py-3 text-left">Property</th>
                  <th className="sticky top-0 z-20 bg-white border-b px-4 py-3 text-left">Priority</th>
                  <th className="sticky top-0 z-20 bg-white border-b px-4 py-3 text-left">Status</th>
                  <th className="sticky top-0 z-20 bg-white border-b px-4 py-3 text-left">Requested By</th>
                  <th className="sticky top-0 z-20 bg-white border-b px-4 py-3 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r: Request) => (
                  <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                    <td className="sticky left-0 bg-white z-20 border-t px-4 py-3 align-top w-[220px]">
                      <div className="font-medium text-gray-800">{r.title}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {r.id}</div>
                    </td>
                    <td className="border-t px-4 py-3 align-top text-sm text-gray-700">{r.description}</td>
                    <td className="border-t px-4 py-3 align-top text-sm text-gray-700">
                      {r.property?.address ?? r.propertyId} {r.property?.city ? `— ${r.property.city}` : ""}
                    </td>
                    <td className="border-t px-4 py-3 align-top text-sm">
                      <span className="inline-block rounded px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700">{r.priority}</span>
                    </td>
                    <td className="border-t px-4 py-3 align-top text-sm">{r.status}</td>
                    <td className="border-t px-4 py-3 align-top text-sm">{r.requestedBy?.user?.firstName ?? "Unknown"} {r.requestedBy?.user?.lastName}</td>
                    <td className="border-t px-4 py-3 align-top text-sm text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
