"use client";

import { CTA } from "./CTAList";

interface Props {
  cta: CTA;
  onEdit: (cta: CTA) => void;
  onDelete: (id: number) => void;
}

export default function CTAItem({ cta, onEdit, onDelete }: Props) {
  return (
    <li className="bg-white shadow-md rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 break-words">
          {cta.title}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mt-1 break-words leading-relaxed">
          {cta.subtitle}
        </p>
        <p className="text-gray-500 text-xs sm:text-sm mt-2 font-medium">
          Page: <span className="text-gray-700">{cta.page}</span>
        </p>
      </div>
      
      <div className="flex gap-2 sm:gap-2 sm:flex-shrink-0 self-end sm:self-center">
        <button
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          onClick={() => onEdit(cta)}
        >
          Edit
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          onClick={() => onDelete(cta.id!)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}