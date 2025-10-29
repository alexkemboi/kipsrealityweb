"use client";

import { CTA } from "./CTAList";

interface Props {
  cta: CTA;
  onEdit: (cta: CTA) => void;
  onDelete: (id: number) => void;
}

export default function CTAItem({ cta, onEdit, onDelete }: Props) {
  return (
    <li className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center border border-gray-200">
      <div>
        <h3 className="font-semibold">{cta.title}</h3>
        <p className="text-gray-500 text-sm">{cta.subtitle}</p>
        <p className="text-gray-400 text-xs mt-1">Page: {cta.page}</p>
      </div>
      <div className="flex gap-2">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          onClick={() => onEdit(cta)}
        >
          Edit
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          onClick={() => onDelete(cta.id!)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
