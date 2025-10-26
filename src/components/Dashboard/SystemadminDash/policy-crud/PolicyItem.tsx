"use client";

import { useState } from "react";
import SectionList from "./SectionList";
import { Policy } from "./PolicyList";

interface Props {
  policy: Policy;
  onEdit: () => void;
  onDelete: () => void;
  refresh: () => void;
}

export default function PolicyItem({ policy, onEdit, onDelete, refresh }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{policy.title}</h2>
          <p className="text-sm text-gray-600">{policy.companyName}</p>
          <p className="text-xs text-gray-500">{policy.contactEmail}</p>
        </div>

        <div className="space-x-2">
          <button
            onClick={onEdit}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Toggle Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-blue-600 text-sm underline hover:text-blue-800"
      >
        {expanded ? "Hide Details" : "View Details"}
      </button>

      {expanded && (
        <div className="mt-4 border-t pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <Detail label="Privacy Email" value={policy.privacyEmail} />
            {policy.website && <Detail label="Website" value={policy.website} />}
            {policy.mailingAddress && (
              <Detail label="Mailing Address" value={policy.mailingAddress} />
            )}
            {policy.responseTime && (
              <Detail label="Response Time" value={policy.responseTime} />
            )}
            {policy.inactiveAccountThreshold && (
              <Detail
                label="Inactive Threshold"
                value={policy.inactiveAccountThreshold}
              />
            )}
          </div>

          {/* Sections */}
          <SectionList
            policyId={policy.id}
            sections={policy.sections}
            refresh={refresh}
          />
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 p-2 rounded border border-gray-200">
      <p className="text-xs uppercase text-gray-400">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}
