"use client";

import Link from "next/link";
import { PlusCircle, ClipboardList } from "lucide-react";

export default function AgentMenuCards() {
  return (
    <section className=" bg-gray-50 flex items-center justify-center 4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl w-full">
        
        <Link href="/marketplace/agent/create" className="group">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <PlusCircle className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                Create New Listing
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Start a new property or product listing to reach potential buyers or renters.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/marketplace/agent/myListings" className="group">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <ClipboardList className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                View My Listings
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Manage, update, or remove your active listings all in one place.
              </p>
            </div>
          </div>
        </Link>

      </div>
    </section>
  );
}
