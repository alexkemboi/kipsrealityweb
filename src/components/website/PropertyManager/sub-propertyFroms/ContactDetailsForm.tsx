'use client'
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Property } from "@/app/data/PropertyData";

interface ContactDetailsSectionProps {
  register: UseFormRegister<Property>;
}

export function ContactDetailsForm({ register }: ContactDetailsSectionProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg">
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-500">Contact Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Phone
          </label>
          <input
            {...register("contactPhone")}
            placeholder="+1 (XXX) XXX-XXXX"
            required
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            {...register("contactEmail")}
            placeholder="contact@example.com"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}