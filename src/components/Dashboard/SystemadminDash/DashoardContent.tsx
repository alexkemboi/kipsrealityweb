'use client'

import { Suspense } from "react"
import dynamic from "next/dynamic"

const ServiceCRUD = dynamic(() => import("./service-crud/ServiceCrud"))
const PolicyCRUD = dynamic(() => import("./policy-crud/PolicyList"))
const AboutUsCRUD = dynamic(() => import("./aboutUs-crud/AboutCard"))


interface DashboardContentProps {
  selected: string
}

export default function DashboardContent({ selected }: DashboardContentProps) {
  const getContent = () => {
    switch (selected) {
      case "Services Page":
        return <ServiceCRUD />
      case "Policy Page":
        return <PolicyCRUD />
        case "About Us Page":
        return <AboutUsCRUD />
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center py-12 text-gray-600">
            <h2 className="text-2xl font-semibold mb-2">Select a Page</h2>
            <p className="max-w-md text-gray-500">
              Choose an item from the sidebar to start managing content.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {/* Suspense fallback handled here */}
          <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
            <div className="animate-fadeIn">{getContent()}</div>
          </Suspense>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}
